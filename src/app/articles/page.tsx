'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  content: string;
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

interface ArticlesResponse {
  articles: Article[];
  pagination: Pagination;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/articles?page=${page}&limit=10`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            throw new Error('获取文章列表失败');
          }
        }
        
        const data: ArticlesResponse = await response.json();
        setArticles(data.articles);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取文章列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [session, status, page, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      // 刷新当前页面
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const formatContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-500 mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">我的文章</h1>
            <button
              onClick={() => router.push('/articles/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              新建文章
            </button>
          </div>
          
          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
              <p className="text-gray-600 mb-4">开始创建你的第一篇文章吧！</p>
              <button
                onClick={() => router.push('/articles/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                创建文章
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {articles.map(article => (
                  <div key={article.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {formatContent(article.content)}
                        </p>
                        <div className="text-xs text-gray-500">
                          <span>创建时间: {new Date(article.createdAt).toLocaleString('zh-CN')}</span>
                          {article.updatedAt !== article.createdAt && (
                            <>
                              <span className="mx-2">•</span>
                              <span>更新时间: {new Date(article.updatedAt).toLocaleString('zh-CN')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => router.push(`/articles/${article.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => router.push(`/articles/${article.id}/edit`)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    共 {pagination.total} 篇文章，第 {pagination.page} / {pagination.totalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}