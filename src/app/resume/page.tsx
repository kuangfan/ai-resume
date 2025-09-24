"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import { useRouter } from "next/navigation";

interface Resume {
  id: string;
  title: string;
  template: string;
  content: string;
  html: string;
  createdAt: string;
  updatedAt: string;
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
interface ResumesResponse {
  resumes: Resume[];
  pagination: Pagination;
}

const Resume = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/resumes?page=${page}&limit=10`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("获取简历失败");
        }

        const data: ResumesResponse = await response.json();
        setResumes(data.resumes);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取简历列表失败");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [page, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇简历吗？")) return;

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      // 刷新当前页面
      setResumes(resumes.filter((resume) => resume.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 只保留markdown内的文字
  const formatContent = (content: string) => {
    // 只保留markdown内的文字
    if (!content) return "";

    let plainText = content;

    // 移除标题标记
    plainText = plainText.replace(/^#{1,6}\s+/gm, "");

    // 移除列表标记
    plainText = plainText.replace(/^[*+-]\s+/gm, "");
    plainText = plainText.replace(/^\d+\.\s+/gm, "");

    // 移除代码块标记
    plainText = plainText.replace(/```[\s\S]*?```/g, "");
    plainText = plainText.replace(/`[^`]+`/g, (match) =>
      match.replace(/`/g, "")
    );

    // 移除加粗、斜体等格式标记
    plainText = plainText.replace(/[*_]{1,3}([^\*_]+)[*_]{1,3}/g, "$1");

    // 移除链接格式 [文本](链接)
    plainText = plainText.replace(/\[(.*?)\]\([^)]+\)/g, "$1");

    // 移除图片格式 ![描述](链接)
    plainText = plainText.replace(/!\[(.*?)\]\([^)]+\)/g, "$1");

    // 移除引用标记
    plainText = plainText.replace(/^>\s+/gm, "");

    // 移除分割线
    plainText = plainText.replace(/^[-*_]{3,}\s*$/gm, "");

    // 移除多余的空行
    plainText = plainText.replace(/\n{3,}/g, "\n\n");

    return plainText.trim();
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
            <h2 className="text-2xl font-semibold">我的简历</h2>
            <p className="text-sm mt-2">查看和管理您的简历</p>
            <Link
              href="/resume/new"
              className="absolute right-6 top-6 px-3 py-2 bg-white cursor-pointer text-indigo-900 font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-opacity-10"
            >
              <i className="fas fa-plus mr-2"></i>新建简历
            </Link>
          </div>
          {resumes.length ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
                <div className="flex-1 grid grid-cols-12 gap-4">
                  <div className="col-span-8 font-medium text-gray-700">
                    简历名称
                  </div>
                  {/* <div className="col-span-3 font-medium text-gray-700">
                    模板
                  </div> */}
                  <div className="col-span-2 font-medium text-gray-700">
                    更新时间
                  </div>
                  <div className="col-span-2 font-medium text-gray-700 text-right">
                    操作
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200 min-h-[396px]">
                {resumes.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-8">
                        <div className="flex items-center">
                          <div className="h-12 w-12 min-w-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <i className="fas fa-file-alt text-indigo-600 text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {formatContent(item.content)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* <div className="col-span-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          现代简约
                        </span>
                      </div> */}
                      <div className="col-span-2 text-sm text-gray-500">
                        {new Date(item.updatedAt).toLocaleString("zh-CN")}
                      </div>
                      <div className="col-span-2 flex justify-end space-x-3">
                        <button
                          onClick={() => router.push(`/resume/${item.id}`)}
                          className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* <div className="p-6 hover:bg-gray-50 transition">
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-file-alt text-green-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            全栈工程师简历
                          </h3>
                          <p className="text-sm text-gray-500">
                            技术主管岗位申请
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        专业风格
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      2023-09-22
                    </div>
                    <div className="col-span-2 flex justify-end space-x-3">
                      <button className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 hover:bg-gray-50 transition">
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-file-alt text-purple-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            产品经理简历
                          </h3>
                          <p className="text-sm text-gray-500">
                            创业公司产品岗位
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        创意设计
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      2023-08-05
                    </div>
                    <div className="col-span-2 flex justify-end space-x-3">
                      <button className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 hover:bg-gray-50 transition">
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-file-alt text-yellow-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            UI设计师简历
                          </h3>
                          <p className="text-sm text-gray-500">
                            设计团队负责人申请
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        艺术风格
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      2023-07-18
                    </div>
                    <div className="col-span-2 flex justify-end space-x-3">
                      <button className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div> */}
              </div>
              {pagination && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    共 <span className="font-medium">{pagination.total}</span>{" "}
                    份简历
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 cursor-pointer border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      上一页
                    </button>

                    {/* 显示第一页 */}
                    {pagination.page > 1 && (
                      <button
                        onClick={() => setPage(1)}
                        className={`px-3 py-1 cursor-pointer rounded text-sm transition ${
                          pagination.page === 1
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        1
                      </button>
                    )}

                    {/* 显示省略号 - 当前页大于3时 */}
                    {pagination.page > 3 && (
                      <span className="px-3 py-1 text-sm text-gray-500">
                        ...
                      </span>
                    )}

                    {/* 显示当前页附近的页码 */}
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => {
                        // 计算要显示的页码范围，保证当前页在中间位置
                        let displayPage;
                        if (pagination.totalPages <= 5) {
                          displayPage = i + 1;
                        } else if (pagination.page <= 2) {
                          displayPage = i + 1;
                        } else if (
                          pagination.page >=
                          pagination.totalPages - 1
                        ) {
                          displayPage = pagination.totalPages - 4 + i;
                        } else {
                          displayPage = pagination.page - 2 + i;
                        }

                        // 避免重复显示页码
                        if (
                          (displayPage === 1 && pagination.page > 1) ||
                          (displayPage === pagination.totalPages &&
                            pagination.page < pagination.totalPages - 2) ||
                          (displayPage > 1 &&
                            displayPage < pagination.page - 2) ||
                          (displayPage < pagination.totalPages &&
                            displayPage > pagination.page + 2)
                        ) {
                          return null;
                        }

                        return (
                          <button
                            key={displayPage}
                            onClick={() => setPage(displayPage)}
                            className={`px-3 py-1 cursor-pointer rounded text-sm transition ${
                              pagination.page === displayPage
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {displayPage}
                          </button>
                        );
                      }
                    )}

                    {/* 显示省略号 - 当前页小于总页数-2时 */}
                    {pagination.page < pagination.totalPages - 2 && (
                      <span className="px-3 py-1 text-sm text-gray-500">
                        ...
                      </span>
                    )}

                    {/* 显示最后一页 - 仅在未被包含在附近页码中时显示 */}
                    {pagination.page < pagination.totalPages &&
                      pagination.totalPages > 5 && (
                        <button
                          onClick={() => setPage(pagination.totalPages)}
                          className={`px-3 py-1 cursor-pointer rounded text-sm transition ${
                            pagination.page === pagination.totalPages
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pagination.totalPages}
                        </button>
                      )}

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 cursor-pointer border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 px-6 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-file-alt text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无简历
              </h3>
              <p className="text-gray-500 mb-6">
                您还没有创建任何简历，点击&quot;新建简历&quot;开始制作您的第一份简历
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Resume;
