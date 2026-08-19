import axios from "axios";

const TIMEOUT_CODES = ["ECONNABORTED", "ETIMEDOUT"];

interface ApiErrorMessageOptions {
  /** 요청 시간 초과 시 문구 */
  timeout?: string;
  /** 응답 자체를 받지 못했을 때(네트워크 단절 등) 문구 */
  network?: string;
  /** 상태 코드별 문구 */
  statusMessages?: Record<number, string>;
}

/**
 * axios 에러를 사용자에게 보여줄 한국어 메시지로 변환합니다.
 * 타임아웃 / 네트워크 실패 / 상태 코드를 구분해 원인을 알 수 있게 합니다.
 */
export function getApiErrorMessage(
  error: unknown,
  options?: ApiErrorMessageOptions,
): string {
  if (axios.isAxiosError(error)) {
    if (error.code && TIMEOUT_CODES.includes(error.code)) {
      return (
        options?.timeout ??
        "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
      );
    }

    if (!error.response) {
      return (
        options?.network ??
        "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요."
      );
    }

    const byStatus = options?.statusMessages?.[error.response.status];
    if (byStatus) return byStatus;
  }

  return error instanceof Error
    ? error.message
    : "알 수 없는 오류가 발생했습니다.";
}
