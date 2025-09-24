import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义工作年限映射到模板文件名的函数
export const workYearsMap = (val: number): string => {
  if (val === 0) return 'junior';
  if (val < 5) return 'senior';
  return 'experienced';
};

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数中的工作年限
    const workYears = request.nextUrl.searchParams.get('workYears');
    if (!workYears) {
      return NextResponse.json({ error: '缺少工作年限参数' }, { status: 400 });
    }

    // 映射工作年限到模板类型
    const templateType = workYearsMap(Number(workYears));
    console.log(`请求模板类型: ${templateType}`);

    // 构建模板文件路径
    const templatePath = path.join(process.cwd(), 'src', 'template', `${templateType}.md`);
    console.log(`模板文件路径: ${templatePath}`);

    // 检查文件是否存在
    if (!fs.existsSync(templatePath)) {
      // 如果请求的模板不存在，回退到junior模板
      const fallbackPath = path.join(process.cwd(), 'src', 'template', 'junior.md');
      if (!fs.existsSync(fallbackPath)) {
        return NextResponse.json({ error: '未找到任何模板文件' }, { status: 404 });
      }
      
      const fallbackContent = fs.readFileSync(fallbackPath, 'utf8');
      return NextResponse.json({ content: fallbackContent, templateType: 'junior' });
    }

    // 读取模板文件内容
    const content = fs.readFileSync(templatePath, 'utf8');
    return NextResponse.json({ content, templateType });
  } catch (error) {
    console.error('读取模板文件失败:', error);
    return NextResponse.json({ error: '读取模板文件失败' }, { status: 500 });
  }
}