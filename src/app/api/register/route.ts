import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/client";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(20, "用户名最多20个字符"),
  password: z
    .string()
    .min(6, "密码至少需要6个字符")
    .max(100, "密码最多100个字符"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "用户注册成功", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
