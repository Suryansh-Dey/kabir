import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'kabir_auth';

export async function verifyAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE);
  return token?.value === process.env.AUTH_SECRET;
}

export function withAuth(handler: (req: Request, ctx?: unknown) => Promise<Response>) {
  return async (req: Request, ctx?: unknown) => {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, ctx);
  };
}

export { AUTH_COOKIE };
