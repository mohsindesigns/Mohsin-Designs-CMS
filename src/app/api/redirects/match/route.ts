import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Redirect from '@/models/Redirect';

export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    await connectToDatabase();
    const redirects = await Redirect.find({ status: 'active' }).lean();

    // Parse the requested URL (the path and search query to match)
    let requestPath = '';
    const questionMarkIndex = urlParam.indexOf('?');
    if (questionMarkIndex !== -1) {
      requestPath = urlParam.substring(0, questionMarkIndex);
    } else {
      requestPath = urlParam;
    }

    const requestUrlObj = new URL(urlParam, 'http://localhost');
    const requestParams = requestUrlObj.searchParams;

    for (const redirect of redirects) {
      let isMatch = false;
      let matchedTargetUrl = redirect.targetUrl;

      if (redirect.isRegex) {
        // Compile regex
        const flags = redirect.ignoreCase ? 'i' : '';
        try {
          const regex = new RegExp(redirect.sourceUrl, flags);
          // Match against pathname (standard)
          const pathMatch = requestPath.match(regex);
          if (pathMatch) {
            isMatch = true;
            // Replace captured groups ($1, $2, etc.) in targetUrl
            let replacedTarget = redirect.targetUrl;
            for (let i = 1; i < pathMatch.length; i++) {
              replacedTarget = replacedTarget.replace(new RegExp(`\\$${i}`, 'g'), pathMatch[i] || '');
            }
            matchedTargetUrl = replacedTarget;
          }
        } catch (e) {
          console.error(`Invalid regex in redirect ${redirect._id}:`, e);
        }
      } else {
        // Simple string matching
        let redirectPath = '';
        let redirectQuery = '';
        try {
          const redirectUrlObj = new URL(redirect.sourceUrl, 'http://localhost');
          redirectPath = redirectUrlObj.pathname;
          redirectQuery = redirectUrlObj.search;
        } catch {
          const questionMarkIndexSrc = redirect.sourceUrl.indexOf('?');
          if (questionMarkIndexSrc !== -1) {
            redirectPath = redirect.sourceUrl.substring(0, questionMarkIndexSrc);
            redirectQuery = redirect.sourceUrl.substring(questionMarkIndexSrc);
          } else {
            redirectPath = redirect.sourceUrl;
          }
        }

        const redirectUrlObj = new URL(redirect.sourceUrl, 'http://localhost');
        const redirectParams = redirectUrlObj.searchParams;

        let normReqPath = requestPath;
        let normRedPath = redirectPath;

        if (redirect.ignoreSlash) {
          normReqPath = normReqPath === '/' ? normReqPath : normReqPath.replace(/\/$/, '');
          normRedPath = normRedPath === '/' ? normRedPath : normRedPath.replace(/\/$/, '');
        }

        if (redirect.ignoreCase) {
          normReqPath = normReqPath.toLowerCase();
          normRedPath = normRedPath.toLowerCase();
        }

        if (normReqPath === normRedPath) {
          // Path matches. Now check query params.
          if (redirect.queryParamMode === 'ignore') {
            isMatch = true;
          } else if (redirect.queryParamMode === 'exact') {
            // Check if request params match redirect params (any order, exact match of key-values)
            const reqKeys = Array.from(requestParams.keys()).sort();
            const redKeys = Array.from(redirectParams.keys()).sort();
            
            if (reqKeys.length === redKeys.length) {
              let keysMatch = true;
              for (let i = 0; i < reqKeys.length; i++) {
                const k = reqKeys[i];
                if (k !== redKeys[i]) {
                  keysMatch = false;
                  break;
                }
                const reqVal = redirect.ignoreCase ? requestParams.get(k)?.toLowerCase() : requestParams.get(k);
                const redVal = redirect.ignoreCase ? redirectParams.get(k)?.toLowerCase() : redirectParams.get(k);
                if (reqVal !== redVal) {
                  keysMatch = false;
                  break;
                }
              }
              if (keysMatch) {
                isMatch = true;
              }
            }
          } else if (redirect.queryParamMode === 'pass') {
            // Exact match only (match query string exactly)
            const reqSearch = redirect.ignoreCase ? requestUrlObj.search.toLowerCase() : requestUrlObj.search;
            const redSearch = redirect.ignoreCase ? redirectUrlObj.search.toLowerCase() : redirectUrlObj.search;
            if (reqSearch === redSearch) {
              isMatch = true;
            }
          }
        }
      }

      if (isMatch) {
        // Increment hits and last accessed date
        await Redirect.findByIdAndUpdate(redirect._id, {
          $inc: { hits: 1 },
          $set: { lastAccessed: new Date() }
        });

        return NextResponse.json({
          targetUrl: matchedTargetUrl,
          statusCode: redirect.statusCode || 301
        });
      }
    }

    return NextResponse.json({ status: 'no_match' });
  } catch (error: any) {
    console.error('Redirect match API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
