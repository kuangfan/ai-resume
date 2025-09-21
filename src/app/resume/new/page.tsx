"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { ExportPDF } from "@vavt/rt-extension";
import "@vavt/rt-extension/lib/asset/ExportPDF.css";

const Resume = () => {
  const [value, setValue] = useState("");
  const [editorHeight, setEditorHeight] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const topEl = topRef.current;
    if (!topEl) return;
    const windowHeight = window.innerHeight;
    console.log(windowHeight, topEl.clientHeight);
    setEditorHeight(windowHeight - topEl.clientHeight);
  }, []);

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
        defToolbars={[
          <ExportPDF key="ExportPDF" value={value} />,
        ]}
      ></MdEditor>
    </div>
  );
};

export default Resume;
