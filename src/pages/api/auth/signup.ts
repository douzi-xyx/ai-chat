import { COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/const";
import { setCookie } from "@/lib/setCookie";
import { authService } from "@/services/auth.service";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleSignUp(req, res);
  }
}

const handleSignUp = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password, name } = req.body;

    // 参数验证
    if (!email || !password || !name) {
      return res.status(400).json(
        { error: '请填写所有必填字段' }
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        { error: '密码至少需要6位字符' },
      );
    }

    // 使用 Supabase Auth 注册用户
    const redirectTo = `http://localhost:3000/api/auth/signup-callback`;
    const { data, error } = await authService.signUp(email, password, name, redirectTo);

    if (error) {
      console.error('注册错误:', error.message);
      return res.status(400).json(
        { error: error.message }
      );
    }

    // 检查是否需要邮箱验证
    // 在 Supabase 中启用邮箱验证时，session 会为 null
    if (data.user && !data.session) {
      return res.status(200).json({
        message: '注册成功！请查收验证邮件',
        user: data.user,
        requiresConfirmation: true,
      });
    }

    // 如果 session 存在，说明邮箱验证未启用或已自动验证，设置 cookie
    if (data.session?.access_token) {
      setCookie(res, COOKIE_NAME, data.session.access_token, COOKIE_OPTIONS);
    }

    return res.status(200).json({
      message: '注册成功',
      user: data.user ? {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name || name,
      } : null,
      requiresConfirmation: false,
    });
  } catch (error) {
    console.error('注册 API 错误:', error instanceof Error ? error.message : String(error));
    return res.status(500).json(
      { error: '服务器错误，请稍后重试' }
    );
  }
}