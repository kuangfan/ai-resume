import { NextRequest } from "next/server";

const system = `
  你是一名资深的简历编写师，精通简历的创建、编辑和优化。你的任务是根据客户的需求，创建出专业、质量高的简历。
  根据用户提供的信息，创建一份简历。要求正常返回，不要用代码块包裹，简历模板如下：
  # 个人简历

  ## 基本信息

  -   **姓名**：你的姓名
  -   **性别**：你的性别
  -   **年龄**：你的年龄
  -   **电话**：你的电话
  -   **邮箱**：你的邮箱
  -   **籍贯**：你的籍贯
  -   **博客/个人主页**：[你的博客或主页名称](你的链接)
  -   **Github**：[你的 Github 主页](你的链接)

  ---

  ## 教育背景

  -   **学校名称**：你就读的大学
  -   **专业**：你的专业
  -   **学历**：你的学历
  -   **时间**：xxxx年xx月 - xxxx年xx月
  -   **相关课程**：主修课程1，主修课程2，主修课程3

  ---

  ## 工作经历

  ### 公司名称一 （xxxx年xx月 - xxxx年xx月）
  -   **职位**：你的职位
  -   **工作描述**：
      -   负责核心系统的设计与开发，使用 Spring Boot 和 MySQL 提升了系统吞吐量 20%。
      -   主导了微服务架构改造，引入 Spring Cloud 和 Docker，降低了系统模块间的耦合度。
      -   优化数据库查询语句和索引，将关键 API 的响应时间从 500ms 降低至 200ms。

  ### 公司名称二 （xxxx年xx月 - xxxx年xx月）
  -   **职位**：你的职位
  -   **工作描述**：
      -   参与开发了用户认证与授权模块，日均处理百万级请求，保证了 99.99% 的可用性。
      -   协助团队完成了从 SVN 到 Git 的版本迁移，并引入了 CI/CD 流程，提升了发布效率。

  ---

  ## 项目经验

  ### [项目名称一](项目链接（可选）)
  -   **技术栈**：Java, Spring Boot, MySQL, Redis, Vue.js
  -   **项目描述**：这是一个基于 Spring Boot 和 Vue.js 的前后端分离项目，主要实现了......（简要描述项目背景、目标和功能）。
  -   **我的职责**：
      -   独立负责后端 API 的设计、开发与性能优化，使用 Redis 缓存热点数据，QPS 提升 30%。
      -   ......
      -   ......

  ### [项目名称二](项目链接（可选）)
  -   **技术栈**：Python, Django, PostgreSQL, Nginx
  -   **项目描述**：该项目是一个......系统，用于......。
  -   **我的职责**：
      -   使用 Django ORM 进行数据库建模，并编写复杂的查询语句。
      -    ......
      -   ......

  ---

  ## 专业技能

  -   **编程语言**: Java (精通), Python (熟悉), JavaScript (熟悉)
  -   **后端框架**: Spring Boot, Spring Cloud, MyBatis, Django
  -   **数据库**: MySQL, PostgreSQL, Redis
  -   **前端技术**: HTML5, CSS3, Vue.js, React
  -   **开发工具**: IntelliJ IDEA, VS Code, Git, Maven, Docker, Linux

  ---

  ## 奖项与证书

  -   xxxx年xx月 - xxxx比赛一等奖
  -   xxxx年xx月 - xxxx认证（如：软考中级证书）
  -   xxxx年xx月 - 校级优秀学生干部

  ---

  ## 自我评价

  本人热爱编程，具备扎实的技术基础和良好的问题解决能力。在项目中，我能快速适应新技术，注重团队协作与沟通。对工作认真负责，渴望在技术深度和广度上不断突破，期待能为贵公司创造价值。
`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "提示词不能为空" }), {
        status: 400,
      });
    }
    
    const response = await fetch(
      "https://spark-api-open.xf-yun.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.API_PASSWORD,
        },
        body: JSON.stringify({
          model: "lite",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "AI接口调用失败" }), {
        status: response.status,
      });
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: "获取响应流失败" }), {
        status: 500,
      });
    }
    
    const decoder = new TextDecoder();

    // 创建一个ReadableStream用于流式输出
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // 发送结束标志
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ done: true })}\n\n`
                )
              );
              controller.close();
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            
            try {
              // 检查是否是结束标记[DONE]
              if (chunk.trim() === "data: [DONE]") {
                continue;
              }
              
              // 提取JSON数据部分
              let jsonStr = chunk.trim();
              if (jsonStr.startsWith("data: ")) {
                jsonStr = jsonStr.slice(6);
              }
              
              // 尝试解析JSON并提取内容
              try {
                // 清理JSON字符串，移除可能的额外字符
                // 查找第一个'{'和最后一个'}'，提取完整的JSON对象
                const firstBrace = jsonStr.indexOf('{');
                const lastBrace = jsonStr.lastIndexOf('}');
                
                if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
                  const cleanJsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
                  const parsedData = JSON.parse(cleanJsonStr);
                  
                  // 检查数据结构并提取内容
                  if (
                    parsedData.choices &&
                    parsedData.choices.length > 0 &&
                    parsedData.choices[0].delta &&
                    parsedData.choices[0].delta.content
                  ) {
                    const content = parsedData.choices[0].delta.content;
                    // 发送内容到前端
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ content, done: false })}\n\n`
                      )
                    );
                  }
                }
              } catch (jsonError) {
                // JSON解析失败时，记录错误但继续处理
                console.error("JSON解析失败:位置282附近", jsonError);
                console.error("问题JSON字符串:", jsonStr.substring(0, 300) + (jsonStr.length > 300 ? '...' : ''));
              }
            } catch (error) {
              // 其他错误时，记录但继续处理
              console.error("处理AI响应chunk时出错:", error);
            }
          }
        } catch (error) {
          console.error("流式传输错误:", error);
          controller.error(error);
        }
      },
    });

    // 返回流式响应，设置Content-Type为text/event-stream
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI接口调用失败:", error);
    return new Response(JSON.stringify({ error: "AI接口调用失败" }), {
      status: 500,
    });
  }
}
