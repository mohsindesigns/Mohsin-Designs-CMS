import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/llms.txt', process.env.NEXT_PUBLIC_SITE_URL || 'https://eaglerevolution.com'), 308);
}
