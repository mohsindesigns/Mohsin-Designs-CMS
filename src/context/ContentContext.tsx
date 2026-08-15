'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
const ContentContext = createContext<any>({});

const deepMerge = (target: any, source: any) => {
  if (!source) return target;
  if (!target) return source;
  
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!(key in target)) {
        output[key] = source[key];
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      // If it's an array and it's empty in source, but has data in target, keep target (for collections)
      if (Array.isArray(source[key]) && source[key].length === 0 && Array.isArray(target[key]) && target[key].length > 0) {
        output[key] = target[key];
      } else {
        output[key] = source[key];
      }
    }
  });
  return output;
};

export const ContentProvider = ({ children, initialData, initialBlogs }: { children: React.ReactNode, initialData?: any, initialBlogs?: any[] }) => {
  // Initialize with server-provided data to eliminate "loading" states on mount
  const [content, setContent] = useState<any>(initialData || {});
  const [blogs, setBlogs] = useState<any[]>(initialBlogs || []);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // Only fetch if initialData is missing (fallback)
    // In production, RootLayout should always provide initialData
    if (initialData && initialBlogs && initialBlogs.length > 0) {
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        const [contentRes, blogRes] = await Promise.all([
          fetch('/api/content'),
          fetch('/api/blog')
        ]);

        if (contentRes.ok) {
          const globalData = await contentRes.json();
          setContent(initialData ? deepMerge(globalData, initialData) : globalData);
        }

        if (blogRes.ok) {
          const blogData = await blogRes.json();
          setBlogs(blogData);
        }
      } catch (error) {
        console.error('Failed to fetch content from DB:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [initialData, initialBlogs]);

  return (
    <ContentContext.Provider value={{ ...content, allBlogs: blogs }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContentContext = () => useContext(ContentContext);
