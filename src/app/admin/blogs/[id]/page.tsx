"use client";

import { useParams } from "next/navigation";
import BlogPostEditor from "@/components/admin/BlogPostEditor";

export default function EditBlogPost({ params }: { params?: any }) {
  const routeParams = useParams();
  const id = (typeof routeParams?.id === "string" ? routeParams.id : params?.id) || "";
  if (!id) return null;
  return <BlogPostEditor id={id} />;
}
