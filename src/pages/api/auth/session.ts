import { COOKIE_NAME } from '@/lib/const';
import { authService } from '@/services/auth.service';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    return getAuth(req, res);
  }
}

const getAuth = async (req: NextApiRequest, res: NextApiResponse) => {
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

    if (!token) {
        return res.json({
          user: null,
        });
    }

    const user = await authService.getUserByToken(token);
    console.log('user-------', user);
    return res.status(200).json({
      message: '会话列表获取成功',
      data: user,
    });
  } catch (error) {
    // console.log('error', error);
    return res.status(500).json({
      message: '获取用户信息失败',
      data: null,
    });
  }
};
