---
name: rels-api-hook
description: |
  Writes TanStack Query hooks and API types for Rels.
  Use this skill when writing new entity hooks, adding queryKeys, adding apiUrls, or modifying existing hooks.
  Used by the rels-api-architect agent.
---

## Writing Order

1. `src/shared/api/apiUrls.ts` — add new URL constants
2. `src/shared/api/queryKeys.ts` — add new query keys
3. `src/entities/{domain}/model/types.ts` — define request/response types
4. `src/entities/{domain}/model/useXxx.ts` — write hook file
5. `src/entities/{domain}/index.ts` — update barrel exports

## Query Hook Pattern

```typescript
// src/entities/{domain}/model/useGet{Resource}.ts
import { useQuery } from "@tanstack/react-query";
import { domainQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { domainUrl } from "@/shared/api/apiUrls";
import type { ResourceType } from "./types";

export const useGet{Resource} = (id: number) => {
  return useQuery({
    queryKey: domainQueryKeys.getOne(id),
    queryFn: () => get<ResourceType>(domainUrl.getOne(id)),
    enabled: !!id,
  });
};
```

## Mutation Hook Pattern

```typescript
// src/entities/{domain}/model/useCreate{Resource}.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { domainQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { domainUrl } from "@/shared/api/apiUrls";
import type { ResourceType } from "./types";

interface Create{Resource}ReqType {
  // request body fields
}

const create{Resource} = (data: Create{Resource}ReqType): Promise<ResourceType> =>
  post<ResourceType, Create{Resource}ReqType>(domainUrl.create(), data);

export const useCreate{Resource} = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: create{Resource},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.all });
    },
  });
};
```

## queryKeys.ts Extension Pattern

```typescript
export const domainQueryKeys = {
  all: ["domain"] as const,
  getAll: () => [...domainQueryKeys.all, "list"] as const,
  getOne: (id: number) => [...domainQueryKeys.all, id] as const,
  getSub: (id: number) => [...domainQueryKeys.all, id, "sub"] as const,
};
```

## apiUrls.ts Extension Pattern

```typescript
export const domainUrl = {
  getAll: () => "/api/domain",
  getOne: (id: number) => `/api/domain/${id}`,
  create: () => "/api/domain",
  update: (id: number) => `/api/domain/${id}`,
  delete: (id: number) => `/api/domain/${id}`,
} as const;
```

## index.ts Barrel Export Pattern

```typescript
export type { ResourceType, CreateResourceReqType } from "./model/types";
export { useGetResource } from "./model/useGetResource";
export { useCreateResource } from "./model/useCreateResource";
export { useUpdateResource } from "./model/useUpdateResource";
export { useDeleteResource } from "./model/useDeleteResource";
```

## Existing Domain State

### lecture
- Hooks: `useGetLectures`, `useGetLecture`, `useCreateLecture`, `useUpdateLecture`, `useDeleteLecture`, `useEnrollLecture`, `useCancelEnrollment`, `useCancelEnrollmentById`, `useGetEnrollments`, `useGetMyLectureEnrollments`
- Keys: `lectureQueryKeys` (all, getAll, getOne, getEnrollments, getMyEnrollments)
- URLs: `lectureUrl` (getAll, create, getOne, update, delete, enroll, cancelEnrollment, getEnrollments, getMyEnrollments)

### notice
- Hooks: `useGetNotices`, `useGetNotice`, `useCreateNotice`, `useUpdateNotice`, `useDeleteNotice`
- Keys: `noticeQueryKeys` (all, getAll, getOne)
- URLs: `noticeUrl` (getAll, getOne, create, update, delete)

### auth
- Hooks: `useGetUserInfo`
- Keys: `authQueryKeys` (all, getUserInfo, postSignIn)
- URLs: `authUrl` (getUserInfo), `authUrls` (dgStart, dgCallback)

## Checklist

- [ ] New key added to `queryKeys.ts`
- [ ] New URL added to `apiUrls.ts`
- [ ] Request/response interfaces defined in `types.ts`
- [ ] `enabled` option prevents execution with invalid id
- [ ] Mutation `onSuccess` invalidates related cache
- [ ] `index.ts` barrel exports updated
