import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 使用从数据库获取的用户ID
const USER_ID = 'e20689f8-d072-46f1-a1a8-dece5466a1bd';

// 生成随机简历数据的函数
function generateResumeData(index) {
  // 职位类型列表
  const jobTypes = ['前端开发工程师', '后端开发工程师', '全栈开发工程师', '产品经理', 'UI设计师', '数据分析师', '测试工程师', '运维工程师'];
  
  // 公司类型列表
  const companyTypes = ['互联网公司', '金融科技公司', '电子商务公司', '人工智能公司', '游戏公司', '传统企业数字化部门'];
  
  // 随机生成工作经验年限
  const experienceYears = Math.floor(Math.random() * 10) + 1;
  
  // 随机选择职位和公司类型
  const randomJobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
  const randomCompanyType = companyTypes[Math.floor(Math.random() * companyTypes.length)];
  
  // 生成标题
  const title = `${randomJobType}简历 #${index + 1}`;
  
  // 生成Markdown内容
  const content = `# ${randomJobType}简历

## 个人信息
- 姓名：应聘者${index + 1}
- 联系方式：test${index + 1}@example.com
- 期望职位：${randomJobType}
- 工作经验：${experienceYears}年

## 教育背景
- 本科：XX大学计算机科学与技术专业
- 硕士：XX大学软件工程专业（可选）

## 工作经历
### ${randomCompanyType}
- 职位：${randomJobType}
- 时间：20${23 - experienceYears}-01 至 至今
- 工作内容：负责公司核心产品的开发和维护，参与需求分析、系统设计、编码实现和测试工作。

## 技能清单
- 编程语言：JavaScript/TypeScript, Python, Java等
- 前端技术：React, Vue, Angular等
- 后端技术：Node.js, Spring Boot等
- 数据库：MySQL, MongoDB等
- 工具：Git, Docker等

## 项目经验
### 项目名称${index + 1}
- 项目描述：这是一个${randomCompanyType}的核心业务系统，负责处理用户请求和数据存储。
- 技术栈：React, Node.js, MySQL
- 我的职责：负责前端页面开发和后端API接口实现。`;
  
  // 生成HTML内容（简化版）
  const html = `<h1>${randomJobType}简历</h1>
<h2>个人信息</h2>
<p>姓名：应聘者${index + 1}</p>
<p>联系方式：test${index + 1}@example.com</p>
<p>期望职位：${randomJobType}</p>
<p>工作经验：${experienceYears}年</p>

<h2>教育背景</h2>
<p>本科：XX大学计算机科学与技术专业</p>

<h2>工作经历</h2>
<p>职位：${randomJobType}，公司：${randomCompanyType}</p>

<h2>技能清单</h2>
<p>编程语言、前端技术、后端技术、数据库、开发工具等</p>`;
  
  return {
    title,
    content,
    html,
    userId: USER_ID
  };
}

// 主函数：生成并插入20条简历数据
async function generateResumes() {
  try {
    console.log('开始生成20条测试简历数据...');
    
    // 生成20条简历数据
    const resumeDataList = Array.from({ length: 20 }, (_, index) => generateResumeData(index));
    
    // 批量插入数据库
    const result = await prisma.resume.createMany({
      data: resumeDataList,
      skipDuplicates: true // 跳过重复记录
    });
    
    console.log(`成功插入${result.count}条简历数据！`);
  } catch (error) {
    console.error('生成简历数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateResumes();