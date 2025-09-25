import { NextRequest } from "next/server";

const system = `
  你是一个专业的简历制作AI助手。请根据用户提供的所有信息和简历模板，生成一份完整的简历。
  遵循以下规则：
  1. 使用提供的模板结构，将所有{{占位符}}替换为用户提供的实际信息
  2. 如果用户未提供某项信息，请合理按照上下文创造一个理想的替代让用户后续自己修改
  3. 保持专业的简历语言风格
  4. 确保所有日期格式统一
  5. 注意时间的Markdown语法格式，前后要加下划线
  6. 尽可能的保证简历的完整性，没有提供的内容发挥你的创造力
`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "消息不能为空" }), {
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
            ...messages
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
