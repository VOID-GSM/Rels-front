---
name: rels-feature-dev
description: |
  Implements Next.js pages under src/app/ for Rels.
  Use this skill when writing new pages, modifying existing pages, or integrating user flows.
  Used by the rels-feature-builder agent.
---

## Page Base Structure

```tsx
"use client"; // only when using useState / useEffect / useRouter

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { useGetResource } from "@/entities/{domain}"; // always import from barrel

export default function {PageName}Page() {
  const router = useRouter();
  const { accessToken, initFromSession, user } = useAuthStore();

  // Auth gate (for authenticated pages)
  useEffect(() => {
    const token = initFromSession();
    if (!token) router.replace("/login");
  }, [initFromSession, router]);

  // Spinner before token is restored — prevents hydration flash
  if (!accessToken) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
      <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-10">
      {/* content */}
    </main>
  );
}
```

## Standard Spinners

```tsx
// Full-screen
<div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
  <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
</div>

// Inline (inside main content area)
<div className="flex items-center justify-center py-20">
  <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
</div>
```

## Dynamic Route Params

```tsx
import { useParams, notFound } from "next/navigation";

const params = useParams();
// Use the folder param name (e.g. [lectureId] → params.lectureId, [noticeId] → params.noticeId)
const id = Number(params.lectureId ?? params.noticeId ?? params.id);
if (isNaN(id)) return notFound();
```

## Loading / Error State Handling

```tsx
const { data, isLoading, isError } = useGetResource(id);

if (isLoading) return (
  <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
    <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
  </div>
);
if (isError) return (
  <p className="text-sm text-gray-400 py-20 text-center">Failed to load.</p>
);
if (!data) return notFound();
```

## Role-Based UI

```tsx
const isCreator = user?.userId === resource.creatorId;
const isAdmin = user?.role === "ADMIN";
const canEdit = isCreator || isAdmin;

{canEdit && <Link href={`/resource/${id}/edit`}><Pencil /></Link>}
```

## Toast Pattern

```tsx
import { toast } from "sonner";
toast.success("Saved.");
toast.error("Something went wrong.");
```

## Mutation Usage Pattern

```tsx
const { mutate, isPending } = useCreateResource();

const handleSubmit = (data: FormData) => {
  mutate(data, {
    onSuccess: () => {
      toast.success("Saved.");
      router.push("/");
    },
    onError: () => toast.error("Something went wrong."),
  });
};
```

## Complex Patterns

For filtering, optimistic enrollment state, LectureForm reuse, and ADMIN-only features, see `references/patterns.md`.
