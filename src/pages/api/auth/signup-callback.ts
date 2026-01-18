import { COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/const";
import { setCookie } from "@/lib/setCookie";
import { authService } from "@/services/auth.service";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * 邮箱验证回调 API
 *
 * 当用户点击邮件中的验证链接时，Supabase 会重定向到这个路由
 * 路由参数包含验证码，我们需要用它交换 session
 *
 * GET /api/auth/signup-callback?code=...
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    return handleSignUpCallback(req, res);
  }
}

// 辅助函数：构建完整的 URL
const getFullUrl = (req: NextApiRequest, path: string = '') => {
    const protocol = req.headers['x-forwarded-proto'] || (req.headers.referer?.startsWith('https') ? 'https' : 'http');
    const host = req.headers.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    return path ? `${baseUrl}${path}` : baseUrl;
};

const handleSignUpCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;
  const errorDescription = req.query.error_description as string | undefined;
console.log('req.query------', req);
    // 处理错误情况
  if (error) {
    console.error('邮箱验证错误:', error, errorDescription);
    return res.redirect(
        getFullUrl(req, `/login?authError=${encodeURIComponent(errorDescription || error)}`)
      );
  }

  console.log('code------', code);

  // 如果有验证码，交换 session
  if (code) {
    try {
      const { data, error: exchangeError } = await authService.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('交换 session 失败:', exchangeError.message);
        return res.redirect(
            getFullUrl(req, `/login?authError=${encodeURIComponent('验证失败，请重试')}`)
        );
      }

      // 验证成功，设置 cookie 并重定向到首页
      if (data.session?.access_token) {
        setCookie(res, COOKIE_NAME, data.session.access_token, COOKIE_OPTIONS);
      }
      return res.redirect(getFullUrl(req, '/'));;
    } catch (err) {
      console.error('验证回调错误:', err instanceof Error ? err.message : String(err));
      return res.redirect(
        getFullUrl(req, `/login?authError=${encodeURIComponent('验证过程中发生错误')}`)
      );
    }
  }

  // 如果没有 code 也没有 error，重定向到登录页
  return res.redirect(getFullUrl(req, '/login'));
}