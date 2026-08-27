// Google Analytics 4 측정 ID.
// 환경변수가 아니라 상수로 둡니다. 측정 ID는 gtag 스니펫에 그대로 실려
// 페이지 소스에 노출되는 공개값이라 숨길 이유가 없고, 이 저장소의
// .gitignore가 .env*를 통째로 무시해서 환경변수로 두면 값이 저장소에
// 남지 않아 배포 환경에서 조용히 누락됩니다.
export const GA_MEASUREMENT_ID = "G-G2RP4YV466" as const;
