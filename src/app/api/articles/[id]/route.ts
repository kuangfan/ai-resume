import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/client';

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const article = await prisma.article.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { title, content } = await request.json();
    
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
    }

    // 验证文章存在且属于当前用户
    const existingArticle = await prisma.article.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: '文章不存在或无权限' }, { status: 404 });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: id },
      data: {
        title: title.trim(),
        content: content.trim(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 });
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证文章存在且属于当前用户
    const article = await prisma.article.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!article) {
      return NextResponse.json({ error: '文章不存在或无权限' }, { status: 404 });
    }

    await prisma.article.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}