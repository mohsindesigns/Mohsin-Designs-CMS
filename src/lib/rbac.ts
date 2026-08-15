import { getAuthSession } from "./auth";
import { NextRequest } from "next/server";

export type Module = 'pages' | 'media' | 'seo' | 'blog' | 'submissions' | 'settings' | 'users' | 'logs';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'publish';

export async function hasPermission(req: NextRequest, module: Module, action: Action) {
  const session = await getAuthSession(req);
  if (!session) return false;

  const permissions = (session as any).permissions;
  if (!permissions) return false;

  const modulePerms = permissions[module];
  if (!modulePerms) return false;

  return !!modulePerms[action];
}

export async function getSessionUser(req: NextRequest) {
  return await getAuthSession(req);
}
