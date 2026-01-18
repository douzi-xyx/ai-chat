export const COOKIE_NAME = 'supabase-access-token';
export const COOKIE_REFRESH_TOKEN = 'supabase-refresh-token';

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 天
};