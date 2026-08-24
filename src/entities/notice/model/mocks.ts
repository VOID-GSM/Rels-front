import type { NoticeListResponse } from "./types";

/**
 * 디자인 작업용 임시 목 데이터입니다.
 * 로그인하지 않은 상태에서 화면을 확인하기 위해서만 사용하고,
 * 디자인 수정이 끝나면 이 파일과 사용처를 함께 제거하세요.
 */

const shiftDateTime = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 19);
};

export const MOCK_NOTICES: NoticeListResponse = {
  totalPages: 1,
  totalElements: 3,
  content: [
    {
      id: 1,
      title: "6월 릴레이 스터디 신청 기간 안내",
      content:
        "6월 릴레이 스터디 신청은 6월 3일 오후 6시에 마감됩니다.\n마감 이후에는 대기 신청만 가능하니 참고해 주세요.",
      authorId: 1,
      authorName: "학생회",
      createdAt: `${shiftDateTime(-1)}`,
    },
    {
      id: 2,
      title: "강연 개설 시 장소 예약을 먼저 확인해 주세요",
      content:
        "3층 세미나실과 대강당은 사전 예약이 필요합니다. 개설 전에 학생회에 문의해 주세요.",
      authorId: 1,
      authorName: "학생회",
      createdAt: `${shiftDateTime(-5)}`,
    },
    {
      id: 3,
      title: "무단 불참이 반복되면 신청이 제한됩니다",
      content:
        "신청한 강연에 참석하지 못하게 되면 마감 전에 반드시 신청을 취소해 주세요.\n무단 불참이 3회 누적되면 한 달간 신청이 제한됩니다.",
      authorId: 1,
      authorName: "학생회",
      createdAt: `${shiftDateTime(-12)}`,
    },
  ],
};
