/**
 * 클립보드에 문자열을 복사합니다.
 * navigator.clipboard는 HTTPS(또는 localhost)에서만 동작하므로,
 * 막히면 임시 textarea + execCommand로 한 번 더 시도합니다.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한이 거절되면 아래 방식으로 넘어갑니다.
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    // 화면 밖에 두어 복사할 때 스크롤이 튀지 않게 합니다.
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied;
  } catch {
    return false;
  }
};
