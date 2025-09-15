// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

// 扩展 NextAuth 的类型定义，添加自定义属性
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    };
  }

  interface User {
    id: string;
    username: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
  }
}