import { authService } from "@/services/auth.service";
import { GetServerSidePropsContext } from "next"
import { COOKIE_NAME } from "./const";

export const withAuth = (handler: (ctx: any) => Promise<any>) => {
    return async (context: GetServerSidePropsContext) => {
        const {req, res} = context;
      // 优先从 cookie 获取 access_token
    let token = req.cookies[COOKIE_NAME];

    // 如果 cookie 中没有，尝试从 Authorization header 获取（兼容旧客户端）
    if (!token) {
       const authHeader = req.headers['authorization'];
       if (authHeader?.startsWith('Bearer ')) {
         token = authHeader.substring(7);
       }
   }
   console.log('token-----', token);

   if (!token) {
       return await handler({
        ...context,
        auth: {user: null},
    })
   }
console.log('token-----', token);
   const response = await authService.getUserByToken(token);
   console.log('response-----', response);
   const  { data: { user }} = response;

   return await handler({
        ...context,
        auth: {user},
    })
}
}