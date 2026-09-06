/**
 * 토큰 저장소입니다.
 *
 * 원래 토큰을 sessionStorage에 담았는데, sessionStorage는 탭마다 따로 존재합니다.
 * 그래서 링크를 새 탭으로 열거나 PWA 창이 새로 뜨면 토큰이 하나도 없는 상태로
 * 시작해 AuthGuard가 곧바로 /login으로 보냈습니다. 같은 브라우저의 모든 탭이
 * 한 세션을 공유하도록 localStorage에 담습니다.
 *
 * localStorage는 탭 사이에 storage 이벤트도 쏘아 주므로, 한 탭에서 로그아웃하거나
 * 토큰을 재발급하면 나머지 탭도 따라올 수 있습니다(authStore의 syncFromStorage).
 */

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

/** 시크릿 모드나 저장소 차단 설정에서는 접근 자체가 예외를 던집니다. */
const readFrom = (storage: Storage | undefined, key: string) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const getLocalStorage = () => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const getSessionStorage = () => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/**
 * 이전 버전이 sessionStorage에 넣어 둔 토큰을 localStorage로 한 번만 옮깁니다.
 * 이 변경 때문에 이미 로그인해 둔 사용자가 다시 로그인하지 않도록 하는 장치라,
 * 옮기고 나면 원본은 지워서 두 저장소가 갈라지지 않게 합니다.
 */
const migrateLegacyTokens = () => {
  const local = getLocalStorage();
  const session = getSessionStorage();
  if (!local || !session) return;

  const legacyAccess = readFrom(session, ACCESS_TOKEN_KEY);
  if (!legacyAccess) return;

  const legacyRefresh = readFrom(session, REFRESH_TOKEN_KEY);

  try {
    if (!readFrom(local, ACCESS_TOKEN_KEY)) {
      local.setItem(ACCESS_TOKEN_KEY, legacyAccess);
      if (legacyRefresh) local.setItem(REFRESH_TOKEN_KEY, legacyRefresh);
    }
    session.removeItem(ACCESS_TOKEN_KEY);
    session.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // 옮기지 못해도 아래 읽기가 localStorage를 그대로 보므로 흐름은 이어집니다.
  }
};

export const getAccessToken = () => {
  migrateLegacyTokens();
  return readFrom(getLocalStorage(), ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  migrateLegacyTokens();
  return readFrom(getLocalStorage(), REFRESH_TOKEN_KEY);
};

export const saveTokens = (accessToken: string, refreshToken: string) => {
  try {
    const local = getLocalStorage();
    local?.setItem(ACCESS_TOKEN_KEY, accessToken);
    local?.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // 저장에 실패해도 authStore 메모리 상태로 현재 탭은 계속 쓸 수 있습니다.
  }
};

export const clearTokens = () => {
  try {
    const local = getLocalStorage();
    local?.removeItem(ACCESS_TOKEN_KEY);
    local?.removeItem(REFRESH_TOKEN_KEY);
    // 옮겨지지 않고 남은 옛 토큰이 되살아나지 않도록 함께 지웁니다.
    const session = getSessionStorage();
    session?.removeItem(ACCESS_TOKEN_KEY);
    session?.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // 지우지 못해도 아래 clearAuth가 메모리 상태는 비웁니다.
  }
};

/** storage 이벤트가 토큰과 관련된 변경인지 판별합니다. key가 null이면 clear()입니다. */
export const isTokenStorageEvent = (event: StorageEvent) =>
  event.storageArea === getLocalStorage() &&
  (event.key === null ||
    event.key === ACCESS_TOKEN_KEY ||
    event.key === REFRESH_TOKEN_KEY);
