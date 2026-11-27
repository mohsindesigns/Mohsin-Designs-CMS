"use client";

import { useParams } from "next/navigation";
import PortfolioItemEditor from "@/components/admin/PortfolioItemEditor";

export default function EditPortfolioItem({ params }: { params?: any }) {
  const routeParams = useParams();
  const id = (typeof routeParams?.id === "string" ? routeParams.id : params?.id) || "";
  if (!id) return null;
  return <PortfolioItemEditor id={id} />;
}
