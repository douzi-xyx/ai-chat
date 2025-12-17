import { NextApiRequest, NextApiResponse } from 'next';
import { getAllSessions } from '@/agent/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    return getSessions(req, res);
  }
}

const getSessions = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sessionList = getAllSessions();
    return res.status(200).json({
      message: '会话列表获取成功',
      data: sessionList,
    });
  } catch (error) {
    // console.log('error', error);
  }
};
