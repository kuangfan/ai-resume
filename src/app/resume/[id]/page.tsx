"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { MdEditor, ExposeParam } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

interface Resume {
  id: string;
  title: string;
  template: string;
  content: string;
  html: string;
  createdAt: string;
  updatedAt: string;
}
interface ResumePageProps {
  params: Promise<{ id: string }>;
}

const Resume = ({ params }: ResumePageProps) => {
  const router = useRouter();
  const [title, setTitle] = useState("未命名简历");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorHeight, setEditorHeight] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ExposeParam>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    const topEl = topRef.current;
    if (!topEl) return;
    const windowHeight = window.innerHeight;
    console.log(windowHeight, topEl.clientHeight);
    setEditorHeight(windowHeight - topEl.clientHeight);

    const loadParams = async () => {
      try {
        const resolvedParams = await params;
        setResumeId(resolvedParams.id);
      } catch (err) {
        setError('参数加载失败');
        setLoading(false);
      }
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/resumes/${resumeId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('简历不存在');
          } else if (response.status === 401) {
            throw new Error('未授权');
          } else {
            throw new Error(`请求失败: ${response.status}`);
          }
        }

        const resumeData: Resume = await response.json();
        setTitle(resumeData.title);
        setValue(resumeData.content);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载简历失败');
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);


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
          console.log("流已关闭");
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
                  console.log("收到结束标志，生成完成");
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
      updateResume(title, v, html);
    });
  };

  const updateResume = async (title: string, content: string, html: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          html: html.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新失败');
      }

      const updatedResume = await response.json();
      console.log('updatedResume', updatedResume.id)
      router.push(`/resume`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  }

  return (
    <div className="bg-white shadow-lg overflow-hidden min-h-screen">
      <div ref={topRef}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <h2 className="text-2xl font-semibold">简历制作</h2>
          <p className="text-sm mt-2">
            根据您保存的个人信息，AI将为您生成专业简历
          </p>
        </div>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            <button
              className="text-gray-500 hover:text-indigo-600 transition-colors"
              onClick={() => {
                const newTitle = prompt("请输入新的简历标题:", title);
                if (newTitle && newTitle.trim()) {
                  // 这里可以添加保存标题的逻辑
                  setTitle(newTitle.trim());
                }
              }}
            >
              ✏️
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={aiGenerate}
              disabled={loading}
              className="px-3 py-2 bg-white cursor-pointer text-indigo-900 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-opacity-95"
            >
              {loading ? <>⏳ 生成中...</> : <>✨ AI生成</>}
            </button>
            <button
              onClick={() => editorRef.current?.triggerSave()}
              className="px-3 py-2 bg-white cursor-pointer text-indigo-900 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-opacity-95"
            >
              💾 保存
            </button>
            <button
              className="px-3 py-2 bg-white cursor-pointer text-indigo-900 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-opacity-95"
              onClick={() => {
                // 导出PDF的简单实现，实际项目中可能需要更复杂的PDF生成逻辑
                window.print();
              }}
            >
              📤 导出
            </button>
          </div>
        </div>
      </div>

      <MdEditor
        ref={editorRef}
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
        ]}
      ></MdEditor>
    </div>
  );
};

export default Resume;
