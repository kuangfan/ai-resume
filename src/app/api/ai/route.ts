import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "提示词不能为空" }), { status: 400 });
    }
    console.log("prompt", prompt);
    const response = await fetch("https://spark-api-open.xf-yun.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + process.env.API_PASSWORD
      },
      body: JSON.stringify({
        model: "lite",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error('AI接口调用失败:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'AI接口调用失败' }), { status: response.status });
    }
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: '获取响应流失败' }), { status: 500 });
    }
    const decoder = new TextDecoder();
    
    // 创建一个ReadableStream用于流式输出
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            // 将数据分块推送给客户端
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }
        } catch (error) {
          console.error('流式传输错误:', error);
          controller.error(error);
        }
      }
    });
    
    // 返回流式响应，设置Content-Type为text/event-stream
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error("AI接口调用失败:", error);
    return new Response(JSON.stringify({ error: "AI接口调用失败" }), { status: 500 });
  }
}
