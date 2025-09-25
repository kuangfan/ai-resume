import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/client';

// 获取简历列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          html: true,
          templateType: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.resume.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      resumes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('获取简历列表失败:', error);
    return NextResponse.json({ error: '获取简历列表失败' }, { status: 500 });
  }
}

// 创建简历
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { title, content, html, templateType } = await request.json();
    
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
    }

    const resume = await prisma.resume.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        html: html.trim(),
        templateType: templateType || 'junior',
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        html: true,
        templateType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('创建简历失败:', error);
    return NextResponse.json({ error: '创建简历失败' }, { status: 500 });
  }
}