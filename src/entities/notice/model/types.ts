export interface NoticeType {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NoticeListResponse {
  content: NoticeType[];
  totalPages: number;
  totalElements: number;
}
