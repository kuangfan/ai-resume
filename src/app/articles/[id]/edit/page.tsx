'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  content: string;
}

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新失败');
      }

      router.push(`/articles/${articleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (articleId) {
      router.push(`/articles/${articleId}`);
    } else {
      router.push('/articles');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">编辑文章</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入文章标题"
                maxLength={200}
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {title.length}/200
              </div>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="请输入文章内容"
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {content.length} 字符
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving || !title.trim() || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}