import { getAuthSession } from "./auth";
import { NextRequest } from "next/server";
import connectToDatabase from "./mongodb";
import User from "@/models/User";

export type Module = 'pages' | 'media' | 'seo' | 'blog' | 'submissions' | 'settings' | 'users' | 'logs';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'publish';

// Re-read the user so deactivation, role edits and revoked sessions take effect immediately.
// Throws on a DB error so callers can tell an outage apart from a denied session.
async function loadActiveUser(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) return null;
  await connectToDatabase();
  const user: any = await User.findById((session as any).userId).populate('role').lean();
  if (!user || user.status !== 'active') return null;
  if ((user.tokenVersion || 0) !== ((session as any).tokenVersion || 0)) return null;
  return { session, user };
}

// One user lookup per request; returns null when not signed in / revoked. Throws on DB error.
export async function getPermissions(req: NextRequest): Promise<Record<string, any> | null> {
  const active = await loadActiveUser(req);
  if (!active) return null;
  return active.user.customPermissions || active.user.role?.permissions || null;
}

export function checkPermission(permissions: Record<string, any> | null | undefined, module: Module, action: Action) {
  return !!permissions?.[module]?.[action];
}

export async function hasPermission(req: NextRequest, module: Module, action: Action, permissions?: Record<string, any> | null) {
  if (permissions !== undefined) return checkPermission(permissions, module, action);
  try {
    return checkPermission(await getPermissions(req), module, action);
  } catch {
    return false;
  }
}

export async function getSessionUser(req: NextRequest) {
  return await getAuthSession(req);
}

// Like getSessionUser, but rejects deactivated users and revoked (tokenVersion-bumped) sessions.
// Throws on a DB error so callers never mistake an outage for "not signed in".
export async function getActiveSessionUser(req: NextRequest) {
  const active = await loadActiveUser(req);
  return active ? active.session : null;
}
