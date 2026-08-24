import axios from "axios";

const TIMEOUT_CODES = ["ECONNABORTED", "ETIMEDOUT"];

/** 서버 사유 문구로 인정할 최대 길이. 이보다 길면 사용자용 문구가 아니라고 봅니다. */
const MAX_SERVER_MESSAGE_LENGTH = 200;

interface ApiErrorMessageOptions {
  /** 요청 시간 초과 시 문구 */
  timeout?: string;
  /** 응답 자체를 받지 못했을 때(네트워크 단절 등) 문구 */
  network?: string;
  /** 상태 코드별 문구 */
  statusMessages?: Record<number, string>;
  /**
   * 백엔드가 내려준 사유를 statusMessages보다 우선해 노출합니다.
   * 하나의 상태 코드가 여러 원인을 가리키는 화면에서 사용합니다.
   */
  preferServerMessage?: boolean;
}

/**
 * 백엔드 에러 응답에서 사용자에게 보여줄 사유만 골라냅니다.
 * 프록시가 끼어들면 HTML 에러 페이지가 내려오기도 하므로 객체 형태만 신뢰합니다.
 */
function extractServerMessage(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;

  const message = (data as { message?: unknown }).message;
  if (typeof message !== "string") return null;

  const trimmed = message.trim();
  if (!trimmed || trimmed.length > MAX_SERVER_MESSAGE_LENGTH) return null;

  return trimmed;
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

    const serverMessage = extractServerMessage(error.response.data);
    if (options?.preferServerMessage && serverMessage) return serverMessage;

    const byStatus = options?.statusMessages?.[error.response.status];
    if (byStatus) return byStatus;

    // 매핑도 사유도 없을 때 axios 원문("Request failed with status code 500")이
    // 그대로 노출되지 않도록 상태 코드만 덧붙여 안내합니다.
    return (
      serverMessage ??
      `요청을 처리하지 못했습니다. (오류 ${error.response.status})`
    );
  }

  return error instanceof Error
    ? error.message
    : "알 수 없는 오류가 발생했습니다.";
}
