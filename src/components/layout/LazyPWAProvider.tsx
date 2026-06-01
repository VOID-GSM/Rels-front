"use client";

import dynamic from "next/dynamic";

const PWAProvider = dynamic(() => import("./PWAProvider"), { ssr: false });

export default function LazyPWAProvider() {
  return <PWAProvider />;
}
