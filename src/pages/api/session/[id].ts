import type { NextApiRequest, NextApiResponse } from 'next';
import { updateSession, deleteSession, getSessionById } from '@/agent/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: '缺少会话 ID' });
  }

  // PUT - 更新会话
  if (req.method === 'PUT') {
    try {
      // req.body 已被 Next.js 自动解析，无需再次 JSON.parse
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name } = body || {};

      if (!name) {
        return res.status(400).json({ message: '缺少会话名称' });
      }

      updateSession(id, name);
      const updated = getSessionById(id);

      return res.status(200).json({
        message: '更新成功',
        data: updated,
      });
    } catch (error) {
      // console.error('更新会话失败:', error);
      return res.status(500).json({ message: '更新会话失败' });
    }
  }

  // DELETE - 删除会话
  if (req.method === 'DELETE') {
    try {
      deleteSession(id);

      return res.status(200).json({
        message: '删除成功',
      });
    } catch (error) {
      // console.error('删除会话失败:', error);
      return res.status(500).json({ message: '删除会话失败' });
    }
  }

  // GET - 获取单个会话
  if (req.method === 'GET') {
    try {
      const session = getSessionById(id);

      if (!session) {
        return res.status(404).json({ message: '会话不存在' });
      }

      return res.status(200).json({
        message: '获取成功',
        data: session,
      });
    } catch (error) {
      // console.error('获取会话失败:', error);
      return res.status(500).json({ message: '获取会话失败' });
    }
  }

  return res.status(405).json({ message: '不支持的请求方法' });
}
