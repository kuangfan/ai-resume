// NextAuth v4 的核心类型定义，用于配置认证选项
import { NextAuthOptions } from "next-auth";
// Prisma 适配器，用于将 NextAuth 与数据库集成
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// 凭证提供者，允许使用用户名/密码进行身份验证
import CredentialsProvider from "next-auth/providers/credentials";
// Prisma 客户端实例，用于数据库操作
import prisma from "./client";
// 密码加密/验证库
import bcrypt from "bcryptjs";

// 导出 NextAuth 配置对象，供 API 路由使用
export const authOptions: NextAuthOptions = {
  // 使用 Prisma 适配器将用户会话数据存储到数据库
  adapter: PrismaAdapter(prisma),
  
  // 配置认证提供者数组，可以配置多个认证方式
  providers: [
    // 凭证认证提供者配置
    CredentialsProvider({
      // 显示名称，用于登录页面
      name: "credentials",
      
      // 定义登录表单字段
      credentials: {
        username: { label: "用户名", type: "text", placeholder: "请输入用户名" },
        password: { label: "密码", type: "password", placeholder: "请输入密码" },
      },
      
      // 授权函数：验证用户凭据
      async authorize(credentials) {
        try {
          // 验证输入完整性
          if (!credentials?.username || !credentials?.password) {
            console.warn("登录失败：缺少用户名或密码");
            return null; // 返回 null 表示认证失败
          }

          // 提取用户名和密码并去除首尾空格
          const username = credentials.username.trim();
          const password = credentials.password;

          // 从数据库查询用户（包含密码字段）
          const user = await prisma.user.findUnique({
            where: { username },
            select: {
              id: true,
              username: true,
              password: true,
            },
          });

          // 用户不存在，认证失败
          if (!user) {
            console.warn(`登录失败：用户 "${username}" 不存在`);
            return null;
          }

          // 验证密码是否正确
          const isPasswordValid = await bcrypt.compare(password, user.password);

          // 密码错误，认证失败
          if (!isPasswordValid) {
            console.warn(`登录失败：用户 "${username}" 密码错误`);
            return null;
          }

          // 认证成功，返回用户对象（将存储在 JWT 中）
          console.log(`登录成功：用户 "${username}"`);
          return {
            id: user.id,
            username: user.username,
          };
        } catch (error) {
          console.error("登录验证错误:", error);
          return null;
        }
      },
    }),
  ],
  
  // 会话配置
  session: {
    strategy: "jwt", // 使用 JWT 存储会话信息（而非数据库存储）
    maxAge: 30 * 24 * 60 * 60, // 30 天过期时间
  },
  
  // 回调函数：控制 JWT 和会话数据的处理
  callbacks: {
    // JWT 回调：在创建/更新 JWT 时调用
    async jwt({ token, user, trigger }) {
      // 如果是首次登录（用户对象存在），将用户信息添加到 token
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      
      // 如果会话更新触发，可以在这里处理会话刷新逻辑
      if (trigger === "update") {
        // 可以在这里更新 token 中的用户信息
      }
      
      return token;
    },
    
    // Session 回调：在创建/更新会话时调用
    async session({ session, token }) {
      // 将 JWT 中的用户信息添加到 session 对象
      if (token?.id && token?.username) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
  
  // 页面配置：自定义认证相关页面
  pages: {
    signIn: "/login", // 指定登录页面路径
    error: "/login", // 错误页面也指向登录页
  },
  
  // 调试配置（开发环境启用）
  debug: process.env.NODE_ENV === "development",
  
  // 加密密钥：用于 JWT 签名，应在环境变量中配置
  secret: process.env.AUTH_SECRET,
};
