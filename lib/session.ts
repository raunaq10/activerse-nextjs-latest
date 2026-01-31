import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  username?: string;
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'activerse-secret-key-change-in-production-min-32-chars',
    cookieName: 'activerse-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
      sameSite: 'lax',
    },
  });

  return session;
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) {
    throw new Error('Unauthorized');
  }
  return session;
}
