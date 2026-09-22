"use client";

import BlogSection from "./sections/BlogSection";

export default function Blog({ data }: { data?: any }) {
  return <BlogSection {...data} />;
}
