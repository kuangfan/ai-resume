/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdEditor, ExposeParam } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { toast } from "sonner";
import "@/template/junior-theme.css";

const Resume = () => {
  const router = useRouter();
  const [title, setTitle] = useState("未命名简历");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ExposeParam>(null);
  const [templateType, setTemplateType] = useState("junior");

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

      const res = await fetch("/api/profile");
      if (!res.ok) {
        toast.error(`获取用户信息失败: ${res.status}`);
        return;
      }

      const profileData = await res.json();
      if (!profileData || Object.keys(profileData).length <= 0) {
        toast.error("请先完善个人信息，以便AI更好的生成简历");
        return;
      }
      profileData.educations = profileData?.Education || [];
      profileData.workExperiences = profileData?.WorkExperience || [];

      console.log("profileData", Object.keys(profileData));
      const workYears = profileData.workYears;
      let template = null;

      try {
        // 通过API获取模板内容，而不是直接导入
        const response = await fetch(`/api/template?workYears=${workYears}`);
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }

        template = await response.json();
        console.log(
          "获取的模板内容:",
          template.content.substring(0, 50) + "..."
        );
        console.log("使用的模板类型:", template.templateType);

        setTemplateType(template.templateType);
        toast.success("模板加载成功");
      } catch (templateError) {
        console.error("加载模板失败:", templateError);
        toast.error("加载模板失败，请稍后重试");
        return;
      }

      // 整理用户信息为格式化文本
      const formattedUserInfo = `个人信息如下：
        姓名：${profileData.realName}
        性别：${profileData.gender}
        手机号：${profileData.phone}
        邮箱：${profileData.email}
        工作年限：${profileData.workYears}年
        求职岗位：${profileData.job}

        教育经历：
        ${
          profileData.educations
            ?.map(
              (edu: any) => `  - ${edu.school} ${edu.major} ${edu.degree}
            时间：${edu.startDate} - ${edu.endDate}`
            )
            .join("\n") || "无"
        }

        工作经历：
        ${
          profileData.workExperiences
            ?.map(
              (exp: any) => `  - ${exp.company} ${exp.position} ${exp.industry}
            时间：${exp.startDate} - ${exp.endDate}
            工作内容：${exp.description}`
            )
            .join("\n") || "无"
        }`;

      console.log("整理后的用户信息:", formattedUserInfo);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "assistant",
              content: `使用如下模板进行创作：${template.content}`,
            },
            { role: "user", content: formattedUserInfo },
          ],
        }),
      });

      if (!response.ok) {
        toast.error(`请求失败: ${response.status}`);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        toast.error("无法获取响应流");
        return;
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
                  toast.success("简历生成完成");
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
      toast.error("AI生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const onSave = (v: string, h: Promise<string>) => {
    console.log(v);

    h.then((html) => {
      console.log(html);
      addResume(title, v, html);
    });
  };

  const addResume = async (title: string, content: string, html: string) => {
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          html: html.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "创建失败");
      }

      const newResume = await response.json();
      console.log("newResume", newResume.id);
      router.push(`/resume`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建简历失败");
    }
  };

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
        previewTheme={templateType}
      ></MdEditor>
    </div>
  );
};

export default Resume;
