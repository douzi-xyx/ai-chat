import { COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/const";
import { deleteCookie } from "@/lib/setCookie";
import { authService } from "@/services/auth.service";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleSignOut(req, res);
  }
}

const handleSignOut = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // 优先从 cookie 获取 access_token
        let token = req.cookies[COOKIE_NAME];

        // 如果 cookie 中没有，尝试从 Authorization header 获取（兼容旧客户端）
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            }
        }

        // 如果有 token，执行登出
        if (token) {
            const { error } = await authService.signOut(token);
            if (error) {
            console.error('登出错误:', error.message);
            return res.status(400).json(
                { error: '登出失败' }
            );
            }
console.log('删除token-----', token);
            // 登出成功，删除 cookie
            deleteCookie(res, COOKIE_NAME, COOKIE_OPTIONS);
        }

        return res.status(200).json({
            message: '退出成功',
        });
    } catch (error) {
        console.error('登出 API 错误:', error instanceof Error ? error.message : String(error));
        return res.status(500).json(
        { error: '服务器错误，请稍后重试' },
        );
    }
}