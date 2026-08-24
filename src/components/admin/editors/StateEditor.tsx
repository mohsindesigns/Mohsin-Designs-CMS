"use client";

import React from "react";
import HomeEditor from "./HomeEditor";

export default function StateEditor({ pageId, data, setData }: { pageId: string; data: any; setData: (d: any) => void }) {
  return <HomeEditor pageId={pageId} data={data} setData={setData} />;
}
