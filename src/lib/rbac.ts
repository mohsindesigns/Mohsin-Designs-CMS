import { getAuthSession } from "./auth";
import { NextRequest } from "next/server";
import connectToDatabase from "./mongodb";
import User from "@/models/User";

export type Module = 'pages' | 'media' | 'seo' | 'blog' | 'submissions' | 'settings' | 'users' | 'logs';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'publish';

export async function hasPermission(req: NextRequest, module: Module, action: Action) {
  const session = await getAuthSession(req);
  if (!session) return false;

  // Re-read the user so deactivation, role edits and revoked sessions take effect immediately.
  let user: any;
  try {
    await connectToDatabase();
    user = await User.findById((session as any).userId).populate('role').lean();
  } catch {
    return false;
  }
  if (!user || user.status !== 'active') return false;
  if ((user.tokenVersion || 0) !== ((session as any).tokenVersion || 0)) return false;

  const permissions = user.customPermissions || user.role?.permissions;
  if (!permissions) return false;

  const modulePerms = permissions[module];
  if (!modulePerms) return false;

  return !!modulePerms[action];
}

export async function getSessionUser(req: NextRequest) {
  return await getAuthSession(req);
}
