import { NextApiRequest, NextApiResponse } from 'next';
import { sessionService } from '@/services/session.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleCreateSession(req, res);
  }
}

const handleCreateSession = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = sessionService.createSessionId(req.body.message);
    return res.status(201).json({
      message: '会话创建成功',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: '会话创建失败',
    });
  }
};
