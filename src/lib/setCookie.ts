import { NextApiResponse } from "next";
import { COOKIE_OPTIONS } from "./const";

// 辅助函数：设置 cookie
export const setCookie = (res: NextApiResponse, name: string, value: string, options: typeof COOKIE_OPTIONS) => {
  const cookieParts = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `HttpOnly`,
    `SameSite=${options.sameSite}`,
  ];
  
  if (options.secure) {
    cookieParts.push('Secure');
  }
  
  res.setHeader('Set-Cookie', cookieParts.join('; '));
};

// 辅助函数：删除 cookie
export const deleteCookie = (res: NextApiResponse, name: string, options: typeof COOKIE_OPTIONS) => {
  const cookieParts = [
    `${name}=`,
    `Path=${options.path}`,
    `Max-Age=0`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `HttpOnly`,
    `SameSite=${options.sameSite}`,
  ];
  
  if (options.secure) {
    cookieParts.push('Secure');
  }
  
  res.setHeader('Set-Cookie', cookieParts.join('; '));
};