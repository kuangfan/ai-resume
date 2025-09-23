import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/client';
import { profileSchema } from "@/schema/profile";

// 获取用户信息
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    const user = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        Education: true,
        WorkExperience: true,
      }
    });
    console.log('user', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}

// 保存用户信息
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    const body = await request.json();
    const validatedData = profileSchema.parse(body);
    const { educations, workExperiences, ...profileData } = validatedData;
    console.log('data', profileData, educations, workExperiences);
    await prisma.$transaction(async (tx) => {
      const existingProfile = await tx.userProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          Education: true,
          WorkExperience: true,
        }
      })
      await tx.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          ...profileData
        },
        create: {
          ...profileData,
          user: { connect: { id: session.user.id } },
        }
      })
      console.log('existingProfile', existingProfile);
      if (existingProfile?.id && educations && educations.length) {
        await tx.education.deleteMany({
          where: {
            userProfileId: existingProfile.id
          }
        })
        await tx.education.createMany({
          data: educations.map(edu => ({
            ...edu,
            userProfileId: existingProfile.id
          }))
        })
        console.log('创建教育经历', educations);
      }
      if (existingProfile?.id && workExperiences && workExperiences.length) {
        await tx.workExperience.deleteMany({
          where: {
            userProfileId: existingProfile.id
          }
        })
        await tx.workExperience.createMany({
          data: workExperiences.map(exp => ({
            ...exp,
            userProfileId: existingProfile.id
          }))
        })
        console.log('创建工作经历', workExperiences);
      }
    })
    return NextResponse.json({ message: '保存成功' });
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return NextResponse.json({ error: '保存用户信息失败' }, { status: 500 });
  }
}
