import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Redirect from '@/models/Redirect';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { invalidateRedirectCache } from '@/app/api/redirects/match/route';
import {
  withLeadingSlash,
  normalizePathForLoopCheck,
  isRedirectLoopWithMap,
  buildActiveRedirectMap,
} from '@/lib/redirectUtils';

// Hard cap on rows per import request, to keep the batch from timing out the request /
// hammering the DB. 2000 is generous for a real-world migration while staying well inside a
// typical serverless/route timeout.
const MAX_IMPORT_ROWS = 2000;
const VALID_STATUS_CODES = [301, 302, 307, 308];
const VALID_QUERY_MODES = ['exact', 'ignore', 'pass'];

type ImportRow = {
  sourceUrl?: string;
  targetUrl?: string;
  statusCode?: number;
  queryParamMode?: string;
  ignoreCase?: boolean;
  ignoreSlash?: boolean;
  isRegex?: boolean;
  status?: string;
  notes?: string;
};

type RowDetail = {
  row: number; // 1-based row index as seen by the admin (matches file row order)
  sourceUrl?: string;
  targetUrl?: string;
  reason: string;
};

// ---- CSV parsing -----------------------------------------------------------------------
// No CSV dependency exists in package.json, and this is a small/well-bounded format (one
// header row + simple columns), so a minimal hand-rolled RFC-4180-ish parser is used instead
// of pulling in a library. Handles quoted fields, embedded commas, embedded newlines inside
// quotes, and doubled "" escapes for a literal quote.
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = content.length;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  while (i < len) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      pushField();
      i += 1;
      continue;
    }
    if (ch === '\r') {
      // Swallow lone CR; CRLF handled by the following \n case.
      i += 1;
      continue;
    }
    if (ch === '\n') {
      pushRow();
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }

  // Final field/row if the file doesn't end with a trailing newline.
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  // Drop fully-empty trailing rows (e.g. trailing blank line).
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

// Documented CSV shape (see UI helper text / sample-redirects.csv):
//   sourceUrl,targetUrl,statusCode,status,notes
// statusCode optional (default 301), status optional (default active), notes optional.
function csvToRows(content: string): ImportRow[] {
  const table = parseCsv(content);
  if (table.length === 0) return [];

  const header = table[0].map((h) => h.trim().toLowerCase());
  const colIdx = (name: string) => header.indexOf(name.toLowerCase());

  const iSource = colIdx('sourceurl');
  const iTarget = colIdx('targeturl');
  const iStatusCode = colIdx('statuscode');
  const iStatus = colIdx('status');
  const iNotes = colIdx('notes');

  const dataRows = table.slice(1);
  return dataRows.map((cols) => ({
    sourceUrl: iSource >= 0 ? (cols[iSource] || '').trim() : '',
    targetUrl: iTarget >= 0 ? (cols[iTarget] || '').trim() : '',
    statusCode: iStatusCode >= 0 && cols[iStatusCode] ? parseInt(cols[iStatusCode], 10) : undefined,
    status: iStatus >= 0 && cols[iStatus] ? cols[iStatus].trim().toLowerCase() : undefined,
    notes: iNotes >= 0 ? (cols[iNotes] || '').trim() : undefined,
  }));
}

// ---- WP "Redirection" plugin JSON export mapping --------------------------------------
// Field mapping (lossy in a couple of spots - documented inline):
//   url or match_url                              -> sourceUrl
//   action_data.url                                -> targetUrl
//   action_code                                     -> statusCode
//   regex (or match_data.source.flag_regex)         -> isRegex
//   match_data.source.flag_case                     -> ignoreCase = !flag_case
//     (WP Redirection's flag_case=true means "case-SENSITIVE matching was requested" -
//      i.e. the inverse of our ignoreCase flag. Default false/undefined -> ignoreCase=false,
//      matching the plugin's own default of case-sensitive matching.)
//   match_data.source.flag_trailing                 -> ignoreSlash
//     (WP Redirection's flag_trailing means "trailing slash is optional/insensitive" for
//      matching, which is the closest analog to our ignoreSlash flag. This is an approximate
//      translation between two different plugins' matching models, not an exact one.)
//   match_data.source.flag_query ('exact'|'ignore'|'pass') -> queryParamMode if it matches one
//      of our enum values, else default 'exact'.
//   enabled                                          -> status ('active' if true else 'disabled')
//   title                                            -> notes (if non-empty)
function wpJsonToRows(parsed: any): ImportRow[] {
  const list = Array.isArray(parsed?.redirects) ? parsed.redirects : [];
  return list.map((r: any): ImportRow => {
    const sourceUrl = r?.url || r?.match_url || '';
    const targetUrl = r?.action_data?.url || '';
    const flagRegex = r?.match_data?.source?.flag_regex;
    const isRegex = typeof flagRegex === 'boolean' ? flagRegex : !!r?.regex;
    const flagCase = r?.match_data?.source?.flag_case;
    const ignoreCase = typeof flagCase === 'boolean' ? !flagCase : false;
    const flagTrailing = r?.match_data?.source?.flag_trailing;
    const ignoreSlash = !!flagTrailing;
    const rawQueryMode = r?.match_data?.source?.flag_query;
    const queryParamMode = VALID_QUERY_MODES.includes(rawQueryMode) ? rawQueryMode : 'exact';
    const statusCode = VALID_STATUS_CODES.includes(r?.action_code) ? r.action_code : 301;
    const status = r?.enabled === false ? 'disabled' : 'active';
    const notes = r?.title ? String(r.title) : '';

    return { sourceUrl, targetUrl, statusCode, queryParamMode, ignoreCase, ignoreSlash, isRegex, status, notes };
  });
}

// Accepts either the raw WP Redirection export shape ({ redirects: [...] }) or a plain array
// of objects already shaped like our own Redirect fields (sourceUrl/targetUrl/...), to keep
// the "JSON" path flexible for a hand-written import too.
function jsonToRows(content: string): ImportRow[] {
  const parsed = JSON.parse(content);
  if (Array.isArray(parsed?.redirects)) {
    return wpJsonToRows(parsed);
  }
  if (Array.isArray(parsed)) {
    return parsed.map((r: any): ImportRow => ({
      sourceUrl: r?.sourceUrl,
      targetUrl: r?.targetUrl,
      statusCode: r?.statusCode,
      queryParamMode: r?.queryParamMode,
      ignoreCase: r?.ignoreCase,
      ignoreSlash: r?.ignoreSlash,
      isRegex: r?.isRegex,
      status: r?.status,
      notes: r?.notes,
    }));
  }
  throw new Error('Unrecognized JSON shape: expected a WP Redirection export ({ redirects: [...] }) or a plain array of redirect objects.');
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'settings', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const { format, content } = body as { format?: string; content?: string };

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'File content is required' }, { status: 400 });
    }
    if (format !== 'json' && format !== 'csv') {
      return NextResponse.json({ error: "format must be 'json' or 'csv'" }, { status: 400 });
    }

    let rows: ImportRow[];
    try {
      rows = format === 'json' ? jsonToRows(content) : csvToRows(content);
    } catch (parseErr: any) {
      return NextResponse.json({ error: `Could not parse file: ${parseErr.message || parseErr}` }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No redirect rows found in the uploaded file.' }, { status: 400 });
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `Too many rows (${rows.length}). Please split the import into batches of ${MAX_IMPORT_ROWS} or fewer.` },
        { status: 400 }
      );
    }

    // Build the active-redirect map ONCE for the whole batch, then extend it in-memory as
    // each row is committed, so loop detection still sees both existing DB redirects AND
    // earlier rows already created within this same import.
    const redirectMap = await buildActiveRedirectMap();

    const details: RowDetail[] = [];
    const toCreate: any[] = [];
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (let idx = 0; idx < rows.length; idx++) {
      const rowNum = idx + 1;
      const row = rows[idx];

      const rawSource = (row.sourceUrl || '').toString().trim();
      const rawTarget = (row.targetUrl || '').toString().trim();

      if (!rawSource || !rawTarget) {
        failed++;
        details.push({ row: rowNum, sourceUrl: rawSource, targetUrl: rawTarget, reason: 'Missing sourceUrl or targetUrl' });
        continue;
      }

      const isRegex = !!row.isRegex;
      const normSourceUrl = isRegex ? rawSource : withLeadingSlash(rawSource);
      const normTargetUrl = withLeadingSlash(rawTarget);

      const statusCode = VALID_STATUS_CODES.includes(row.statusCode as number) ? (row.statusCode as number) : 301;
      const queryParamMode = VALID_QUERY_MODES.includes(row.queryParamMode as string) ? (row.queryParamMode as string) : 'exact';
      const status = row.status === 'disabled' ? 'disabled' : 'active';

      if (normalizePathForLoopCheck(normSourceUrl) === normalizePathForLoopCheck(normTargetUrl)) {
        skipped++;
        details.push({ row: rowNum, sourceUrl: normSourceUrl, targetUrl: normTargetUrl, reason: 'A URL cannot redirect to itself' });
        continue;
      }

      // Only rules that will actually be active can create or extend a redirect chain, so
      // disabled rows skip the loop check (matching how buildActiveRedirectMap only considers
      // active redirects in the first place).
      if (status === 'active' && isRedirectLoopWithMap(normSourceUrl, normTargetUrl, redirectMap)) {
        skipped++;
        details.push({ row: rowNum, sourceUrl: normSourceUrl, targetUrl: normTargetUrl, reason: 'Redirect loop detected' });
        continue;
      }

      toCreate.push({
        sourceUrl: normSourceUrl,
        targetUrl: normTargetUrl,
        statusCode,
        queryParamMode,
        ignoreCase: !!row.ignoreCase,
        ignoreSlash: !!row.ignoreSlash,
        isRegex,
        status,
        notes: row.notes || '',
      });

      if (status === 'active') {
        redirectMap.set(normalizePathForLoopCheck(normSourceUrl), normalizePathForLoopCheck(normTargetUrl));
      }
      created++;
    }

    let insertedDocs: any[] = [];
    if (toCreate.length > 0) {
      insertedDocs = await Redirect.insertMany(toCreate, { ordered: false });
    }

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'IMPORT_REDIRECTS',
      entity: 'Redirect',
      details: {
        message: `Imported redirects: ${created} created, ${skipped} skipped, ${failed} failed (of ${rows.length} total, format=${format})`,
        created,
        skipped,
        failed,
        total: rows.length,
      },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown',
    });

    invalidateRedirectCache();

    return NextResponse.json({
      created,
      skipped,
      failed,
      total: rows.length,
      details,
      insertedCount: insertedDocs.length,
    });
  } catch (error: any) {
    console.error('Redirect import error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
