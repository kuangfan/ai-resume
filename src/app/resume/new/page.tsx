"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { ExportPDF } from "@vavt/rt-extension";
import "@vavt/rt-extension/lib/asset/ExportPDF.css";

const Resume = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const topEl = topRef.current;
    if (!topEl) return;
    const windowHeight = window.innerHeight;
    console.log(windowHeight, topEl.clientHeight);
    setEditorHeight(windowHeight - topEl.clientHeight);
  }, []);

  const aiGenerate = async () => {
    try {
      setLoading(true);
      setValue(""); // 清空编辑器内容准备接收新内容

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "帮我生成一份计算机校招生的简历，排版要好看",
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法获取响应流");
      }

      let accumulatedText = "";

      // 处理流式响应
      let isDone = false;
      while (!isDone) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('流已关闭');
          break;
        }

        try {
          const chunk = decoder.decode(value, { stream: true });
          // 解析SSE格式的数据
          const lines = chunk.split("\n\n");
          
          console.log(`处理chunk: ${lines.length}行数据`);

          for (const line of lines) {
            if (line.trim().startsWith("data:") && line.length > 5) {
              try {
                const dataStr = line.slice(5).trim(); // 去掉'data: '前缀并去除首尾空白
                if (!dataStr) continue; // 跳过空数据
                
                const data = JSON.parse(dataStr);
                
                // 检查是否是结束标志
                if (data.done === true) {
                  console.log('收到结束标志，生成完成');
                  isDone = true;
                  break;
                }
                
                // 处理内容块
                if (data.content && !data.done) {
                  accumulatedText += data.content;
                  setValue(accumulatedText);
                  console.log(`累计内容长度: ${accumulatedText.length}`);
                }
              } catch (e) {
                console.error("解析单行数据失败:", e);
                console.error("问题行数据:", line);
                // 继续处理下一行，不因单行失败而中断
                continue;
              }
            }
          }
        } catch (chunkError) {
          console.error("处理chunk时出错:", chunkError);
          // 继续处理下一个chunk
          continue;
        }
      }
      
      // 确保最终内容被设置到编辑器
      setValue(accumulatedText);
      console.log("流式响应处理完成，最终内容长度:", accumulatedText.length);
    } catch (err) {
      console.error("AI生成失败", err);
      setValue("AI生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const onSave = (v: string, h: Promise<string>) => {
    console.log(v);

    h.then((html) => {
      console.log(html);
    });
  };

  return (
    <div className="bg-white shadow-lg overflow-hidden min-h-screen">
      <div
        ref={topRef}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white"
      >
        <h2 className="text-2xl font-semibold">简历制作</h2>
        <p className="text-sm mt-2">
          根据您保存的个人信息，AI将为您生成专业简历
        </p>

        <button
          onClick={aiGenerate}
          disabled={loading}
          className="absolute right-6 top-6 px-3 py-2 bg-white cursor-pointer text-indigo-900 font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-opacity-10"
        >
          {loading ? <>⏳ 生成中...</> : <>✨ AI生成简历</>}
        </button>
      </div>

      <MdEditor
        style={{ height: editorHeight }}
        value={value}
        onChange={setValue}
        onSave={onSave}
        toolbars={[
          "bold",
          "underline",
          "italic",
          "strikeThrough",
          "-",
          "title",
          "unorderedList",
          "orderedList",
          "-",
          "link",
          "table",
          "=",
          "save",
          0,
        ]}
        defToolbars={[<ExportPDF key="ExportPDF" value={value} />]}
      ></MdEditor>
    </div>
  );
};

export default Resume;
