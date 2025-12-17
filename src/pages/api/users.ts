// 示例：支持多种 HTTP 方法的 API 路由
import type { NextApiRequest, NextApiResponse } from "next";

type User = {
  id: string;
  name: string;
  email: string;
};

type Data = {
  message?: string;
  user?: User;
  users?: User[];
  error?: string;
};

// 模拟数据库（实际项目中应该使用真实数据库）
// 注意：在生产环境中应该使用真实的数据库
// 使用对象包装以便可以修改（示例代码需要）
const db = {
  users: [
    { id: "1", name: "张三", email: "zhangsan@example.com" },
    { id: "2", name: "李四", email: "lisi@example.com" },
  ] as User[],
};

const users = db.users;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PATCH":
      return handlePatch(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
      res.status(405).json({ error: `方法 ${method} 不被允许` });
  }
}

// GET - 获取用户列表或单个用户
function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (id) {
    // 获取单个用户
    const user = users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }
    return res.status(200).json({ user });
  }

  // 获取所有用户
  return res.status(200).json({ users });
}

// POST - 创建新用户
function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { name, email } = req.body;

  // 验证必填字段
  if (!name || !email) {
    return res.status(400).json({ error: "姓名和邮箱为必填项" });
  }

  // 检查邮箱是否已存在
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "邮箱已存在" });
  }

  // 创建新用户
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
  };

  users.push(newUser);

  return res.status(201).json({
    message: "用户创建成功",
    user: newUser,
  });
}

// PATCH - 更新用户信息
function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;
  const { name, email } = req.body;

  if (!id) {
    return res.status(400).json({ error: "用户ID为必填项" });
  }

  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "用户不存在" });
  }

  // 更新用户信息
  if (name) users[userIndex].name = name;
  if (email) {
    // 检查邮箱是否被其他用户使用
    if (users.some((u) => u.id !== id && u.email === email)) {
      return res.status(409).json({ error: "邮箱已被其他用户使用" });
    }
    users[userIndex].email = email;
  }

  return res.status(200).json({
    message: "用户更新成功",
    user: users[userIndex],
  });
}

// DELETE - 删除用户
function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "用户ID为必填项" });
  }

  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "用户不存在" });
  }

  users.splice(userIndex, 1);

  return res.status(200).json({ message: "用户删除成功" });
}

