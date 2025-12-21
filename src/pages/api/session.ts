import { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'node:crypto';
import { createSession, deleteSession, getAllSessions } from '@/agent/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleCreateSession(req, res);
  }
}

const handleCreateSession = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name } = await JSON.parse(req.body);
    const sessionId = randomUUID();
    const data = createSession(sessionId, name);
    return res.status(201).json({
      message: '会话创建成功',
      data,
    });
  } catch (error) {
    // console.log('error', error);
    return res.status(500).json({
      message: '会话创建失败',
    });
  }
};
