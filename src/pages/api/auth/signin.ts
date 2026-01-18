import { COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/const";
import { setCookie } from "@/lib/setCookie";
import { authService } from "@/services/auth.service";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleSignIn(req, res);
  }
}


const handleSignIn = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  // 参数验证
  if (!email || !password) {
    return res.status(400).json(
      { error: '请填写所有必填字段' }
    );
  }
  
  // 使用 Supabase Auth 登录
  const { data, error } = await authService.signIn(email, password);

  if (error) {
    console.error('登录错误:', error.message);
    return res.status(401).json(
      { error: '邮箱或密码错误' },
    );
  }
console.log('data.session-----', data.session);
  // 设置 access_token cookie
  if (data.session?.access_token) {
    setCookie(res, COOKIE_NAME, data.session.access_token, COOKIE_OPTIONS);
  }

  return res.status(200).json({
    message: '登录成功',
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email,
    },
  });
}