import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/client";

// 获取单篇简历
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        html: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "简历不存在" }, { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("获取简历失败:", error);
    return NextResponse.json({ error: "获取简历失败" }, { status: 500 });
  }
}

// 更新简历
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { title, content, html } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    // 验证简历存在且属于当前用户
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: "简历不存在或无权限" },
        { status: 404 }
      );
    }

    const updatedResume = await prisma.resume.update({
      where: { id: id },
      data: {
        title: title.trim(),
        content: content.trim(),
        html: html.trim(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        html: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("更新简历失败:", error);
    return NextResponse.json({ error: "更新简历失败" }, { status: 500 });
  }
}

// 删除简历
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 验证简历存在且属于当前用户
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "简历不存在或无权限" },
        { status: 404 }
      );
    }

    await prisma.resume.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除简历失败:", error);
    return NextResponse.json({ error: "删除简历失败" }, { status: 500 });
  }
}
