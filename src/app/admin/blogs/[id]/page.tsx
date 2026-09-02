"use client";

import { use } from "react";
import BlogPostEditor from "@/components/admin/BlogPostEditor";

export default function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BlogPostEditor id={id} />;
}
