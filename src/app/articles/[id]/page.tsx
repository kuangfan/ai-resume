'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolvedParams = await params;
        setArticleId(resolvedParams.id);
      } catch (err) {
        setError('参数加载失败');
        setLoading(false);
      }
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (status === 'loading' || !articleId) return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${articleId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('文章不存在');
          } else if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            throw new Error('获取文章失败');
          }
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, session, status, router]);

  const handleDelete = async () => {
    if (!articleId || !confirm('确定要删除这篇文章吗？')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      router.push('/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-500 mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/articles')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">文章不存在</h2>
            <button
              onClick={() => router.push('/articles')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {article.title}
                </h1>
                <p className="text-sm text-gray-500">
                  创建时间: {new Date(article.createdAt).toLocaleString('zh-CN')}
                </p>
                {article.updatedAt !== article.createdAt && (
                  <p className="text-sm text-gray-500">
                    更新时间: {new Date(article.updatedAt).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/articles/${articleId}/edit`)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {article.content}
              </pre>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/articles')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← 返回列表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}