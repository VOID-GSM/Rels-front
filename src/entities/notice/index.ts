export type { NoticeType, NoticeListResponse } from "./model/types";
export { useGetNotices } from "./model/useGetNotices";
export { useGetNotice } from "./model/useGetNotice";
export { useCreateNotice } from "./model/useCreateNotice";
export { useUpdateNotice } from "./model/useUpdateNotice";
export { useDeleteNotice } from "./model/useDeleteNotice";

// 디자인 작업용 임시 목 데이터 (작업 종료 후 제거)
export { MOCK_NOTICES } from "./model/mocks";
