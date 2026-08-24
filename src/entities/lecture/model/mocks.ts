import type {
  EnrollmentApplicant,
  LectureEnrollmentsType,
  LectureType,
  MyLectureEnrollmentsType,
} from "./types";

/**
 * 디자인 작업용 임시 목 데이터입니다.
 * 로그인하지 않은 상태에서 화면을 확인하기 위해서만 사용하고,
 * 디자인 수정이 끝나면 이 파일과 사용처를 함께 제거하세요.
 */

/** 목 데이터에서 "내가 생성한 강연"으로 취급할 유저 id */
export const MOCK_USER_ID = 1;

const shiftDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const MOCK_LECTURES: LectureType[] = [
  {
    lectureId: 1,
    title: "React 렌더링 최적화 파헤치기",
    description: `React가 느려졌다는 말은 대부분 불필요한 리렌더링이 많다는 뜻입니다. 그런데 정작 어디서 몇 번 다시 그려지는지 확인하지 않고 memo부터 붙이는 경우가 많죠.

이번 강연에서는 순서를 뒤집어서 봅니다. 먼저 React DevTools의 Profiler로 실제 리렌더링을 눈으로 확인하고, 왜 그 컴포넌트가 다시 그려졌는지 이유를 하나씩 찾아냅니다. state가 바뀌어서인지, 부모가 다시 그려져서인지, 매 렌더마다 새 객체를 props로 넘기고 있어서인지 구분할 수 있게 되는 게 목표입니다.

그다음에야 memo, useMemo, useCallback을 씁니다. 세 개가 각각 무엇을 기억하는지, 언제 붙이면 오히려 손해인지도 같이 다룹니다. 실제로 memo를 붙였는데 아무 효과가 없는 코드를 준비해 왔으니 왜 안 먹는지 직접 찾아보시면 됩니다.

마지막으로는 상태를 어디에 두느냐만 바꿔서 memo 없이 리렌더링을 줄이는 방법을 봅니다. 대부분의 최적화는 사실 여기서 끝납니다.

노트북과 Node 20 이상만 준비해 오시면 됩니다. 예제 저장소는 당일 아침에 공유합니다.`,
    creatorId: MOCK_USER_ID,
    creatorName: "김하늘",
    creatorStudentNumber: "2301",
    lectureStatus: "CONFIRMED",
    capacityByGrade: { "1": 8, "2": 8, "3": 4 },
    totalCapacity: 20,
    enrolledCount: 18,
    waitingCount: 5,
    lectureLocation: "3층 세미나실",
    lectureDate: shiftDate(6),
    lectureTime: "16:30:00",
    applicationDeadline: `${shiftDate(3)}T23:59:59`,
    createdAt: `${shiftDate(-14)}T10:12:00`,
  },
  {
    lectureId: 2,
    title: "처음 시작하는 도커 & 컨테이너",
    description: `제 컴퓨터에서는 되는데요, 를 그만하기 위한 강연입니다.

도커를 한 번도 안 써봤다는 가정으로 시작합니다. 이미지와 컨테이너가 뭐가 다른지, docker run을 쳤을 때 실제로 무슨 일이 벌어지는지부터 천천히 봅니다. 여기가 헷갈리면 뒤가 전부 헷갈리기 때문에 시간을 넉넉히 씁니다.

그다음 직접 Dockerfile을 씁니다. 간단한 Node 서버를 이미지로 만들면서 레이어 캐시가 어떻게 동작하는지, COPY 순서만 바꿔도 빌드 시간이 왜 확 달라지는지 확인합니다.

마지막으로 docker compose로 서버와 데이터베이스를 한 번에 띄웁니다. 팀 프로젝트에서 새 팀원이 clone 받고 명령어 하나로 개발 환경을 띄우는 것까지가 이 강연의 목표입니다.

Docker Desktop을 미리 설치해 오시면 좋습니다. 설치가 막히면 시작 전에 도와드릴게요.`,
    creatorId: MOCK_USER_ID,
    creatorName: "김하늘",
    creatorStudentNumber: "2301",
    lectureStatus: "OPEN",
    capacityByGrade: { "1": 10, "2": 10, "3": 10 },
    totalCapacity: null,
    enrolledCount: 7,
    waitingCount: 0,
    lectureLocation: "2층 강의실 A",
    lectureDate: shiftDate(11),
    lectureTime: "17:00:00",
    applicationDeadline: `${shiftDate(8)}T23:59:59`,
    createdAt: `${shiftDate(-9)}T09:40:00`,
  },
  {
    lectureId: 3,
    title: "타입스크립트 제네릭 실전 사용법",
    description: `제네릭은 배울 때는 알겠는데 막상 쓰려고 하면 손이 안 나가는 문법입니다. 이 강연은 문법 설명 대신, 제네릭이 필요해지는 순간을 하나씩 만들어보면서 진행합니다.

먼저 any로 대충 넘긴 코드에서 출발합니다. 그 any 때문에 어떤 버그가 조용히 지나가는지 보고, 타입을 제대로 붙였을 때 에디터가 무엇을 대신 잡아주는지 확인합니다.

그다음 제네릭을 넣습니다. 함수 하나를 여러 타입에 재사용하는 기본형에서 시작해 extends로 제약을 거는 법, 타입 추론이 어디까지 알아서 해주는지를 봅니다. 언제 타입 인자를 직접 써야 하고 언제 생략해도 되는지 감을 잡는 게 목표입니다.

후반부에는 Partial, Pick, Omit 같은 유틸리티 타입을 직접 구현하고, 서버가 주는 JSON을 프론트에서 쓰기 좋은 형태로 바꾸는 변환 타입을 같이 작성합니다.

타입스크립트를 조금이라도 써본 분이면 따라오실 수 있습니다. 노트북만 챙겨 오세요.`,
    creatorId: 2,
    creatorName: "박서준",
    creatorStudentNumber: "2215",
    lectureStatus: "OPEN",
    capacityByGrade: { "1": 6, "2": 9, "3": 5 },
    totalCapacity: 20,
    enrolledCount: 12,
    waitingCount: 3,
    lectureLocation: "1층 오픈랩",
    lectureDate: shiftDate(4),
    lectureTime: "15:00:00",
    applicationDeadline: `${shiftDate(1)}T23:59:59`,
    createdAt: `${shiftDate(-20)}T13:05:00`,
  },
  {
    lectureId: 4,
    title: "깃 브랜치 전략과 협업 워크플로",
    description: `혼자 할 때는 add, commit, push 세 개면 충분했는데 팀 프로젝트에 들어가는 순간 깃이 무서워집니다. 이 강연은 그 지점을 넘기 위한 강연입니다.

브랜치가 실제로 무엇인지부터 다시 봅니다. 커밋이 어떻게 이어지는지 그림으로 확인하고 나면 merge와 rebase가 무슨 차이인지, 왜 어떤 팀은 rebase를 쓰지 말라고 하는지 이해가 됩니다.

그다음 충돌을 일부러 냅니다. 두 명이 같은 줄을 고친 상황을 만들어 놓고 직접 해결해봅니다. 충돌 표시가 무슨 뜻인지, 잘못 합쳤을 때 어떻게 되돌리는지까지 해봐야 실전에서 당황하지 않습니다.

마지막으로 PR을 기준으로 도는 흐름을 정리합니다. 브랜치 이름 규칙, 커밋 메시지, 리뷰 받고 반영하는 순서까지 팀에서 바로 쓸 수 있는 형태로 만들어 갑니다.

깃허브 계정과 노트북을 준비해 오세요.`,
    creatorId: 3,
    creatorName: "이도윤",
    creatorStudentNumber: "2408",
    lectureStatus: "CONFIRMED",
    capacityByGrade: { "1": 12, "2": 8, "3": 5 },
    totalCapacity: 25,
    enrolledCount: 25,
    waitingCount: 9,
    lectureLocation: "3층 세미나실",
    lectureDate: shiftDate(2),
    lectureTime: "16:00:00",
    applicationDeadline: `${shiftDate(-1)}T23:59:59`,
    createdAt: `${shiftDate(-25)}T11:20:00`,
  },
  {
    lectureId: 5,
    title: "SQL 인덱스가 느려질 때",
    description: `인덱스를 걸었는데 여전히 느린 쿼리를 앞에 두고 시작합니다.

EXPLAIN을 읽는 법부터 봅니다. type, key, rows가 각각 무슨 뜻인지 알면 이 쿼리가 인덱스를 타는지 아닌지 바로 보입니다. 여기까지만 익혀도 절반은 해결됩니다.

그다음 인덱스가 안 먹는 대표적인 경우들을 하나씩 재현합니다. 컬럼에 함수를 씌운 경우, 앞부분이 아닌 중간부터 LIKE를 건 경우, 복합 인덱스의 순서를 잘못 잡은 경우를 직접 쿼리를 쳐 가며 확인합니다.

마지막으로 실제 데이터 수십만 건을 넣어두고 인덱스 유무에 따라 시간이 어떻게 달라지는지 측정해봅니다.

MySQL이 설치되어 있으면 좋지만, 없으면 도커로 같이 띄우겠습니다.`,
    creatorId: 4,
    creatorName: "최유나",
    creatorStudentNumber: "2312",
    lectureStatus: "OPEN",
    capacityByGrade: { "1": 4, "2": 6, "3": 5 },
    totalCapacity: 15,
    enrolledCount: 4,
    waitingCount: 0,
    lectureLocation: "2층 강의실 B",
    lectureDate: shiftDate(9),
    lectureTime: "17:30:00",
    applicationDeadline: `${shiftDate(-2)}T23:59:59`,
    createdAt: `${shiftDate(-18)}T14:55:00`,
  },
  {
    lectureId: 6,
    title: "CS 면접 대비 네트워크 기초",
    description: `면접에서 자주 나오는 네트워크 질문들을 실제로 이해하고 답할 수 있게 정리하는 시간입니다.

주소창에 URL을 치고 엔터를 누른 뒤 화면이 뜨기까지 무슨 일이 일어나는지를 축으로 잡고, 그 흐름 위에 DNS, TCP, HTTP, TLS를 하나씩 올립니다. 개념을 따로따로 외우는 것보다 한 줄기로 꿰는 편이 오래 갑니다.

3-way handshake는 왜 세 번인지, 끊을 때는 왜 네 번인지, HTTPS에서 대칭키와 비대칭키를 왜 섞어 쓰는지까지 왜에 답할 수 있는 수준을 목표로 합니다.

준비물은 없습니다. 필기할 것만 챙겨 오세요.`,
    creatorId: 5,
    creatorName: "정민재",
    creatorStudentNumber: "2126",
    lectureStatus: "CLOSED",
    capacityByGrade: { "1": 10, "2": 10, "3": 10 },
    totalCapacity: 30,
    enrolledCount: 28,
    waitingCount: 0,
    lectureLocation: "대강당",
    lectureDate: shiftDate(-7),
    lectureTime: "16:00:00",
    applicationDeadline: `${shiftDate(-10)}T23:59:59`,
    createdAt: `${shiftDate(-40)}T10:00:00`,
  },
  {
    lectureId: 7,
    title: "피그마로 개발자가 디자인하기",
    description: `디자이너가 되자는 강연이 아니라, 개발자가 자기 토이 프로젝트 화면을 스스로 정돈할 수 있게 되자는 강연입니다.

피그마의 오토레이아웃부터 봅니다. 사실상 flexbox라서 CSS를 아는 사람에게는 오히려 쉽습니다. 여백, 정렬, 늘어남을 어떻게 잡는지 익히고 나면 화면이 훨씬 빨리 정리됩니다.

그다음 컴포넌트와 배리언트를 만듭니다. 버튼 하나를 만들고 상태별로 배리언트를 붙여보면, 코드에서 props로 나누던 것과 똑같은 사고방식이라는 게 보입니다.

마지막으로 색과 글자 크기를 변수로 빼서 아주 작은 디자인 시스템을 만들어봅니다.

피그마 계정만 만들어 오시면 됩니다.`,
    creatorId: 6,
    creatorName: "한소연",
    creatorStudentNumber: "2419",
    lectureStatus: "CLOSED",
    capacityByGrade: { "1": 7, "2": 7, "3": 6 },
    totalCapacity: 20,
    enrolledCount: 16,
    waitingCount: 2,
    lectureLocation: "1층 오픈랩",
    lectureDate: shiftDate(-3),
    lectureTime: "15:30:00",
    applicationDeadline: `${shiftDate(-6)}T23:59:59`,
    createdAt: `${shiftDate(-30)}T16:30:00`,
  },
  {
    lectureId: 8,
    title: "테스트 코드, 어디부터 짜야 할까",
    description: `테스트 코드를 짜야 한다는 건 알겠는데 무엇부터 짜야 할지 모르겠는 사람을 위한 강연입니다.

커버리지 100%를 목표로 하지 않습니다. 오히려 테스트하지 않아도 되는 것들을 먼저 골라냅니다. 어떤 코드가 깨졌을 때 가장 아픈지를 기준으로 삼으면 짤 것과 안 짤 것이 꽤 명확하게 갈립니다.

그다음 실제로 짭니다. 순수 함수 테스트에서 시작해서, 외부 의존이 있는 코드를 어떻게 떼어놓고 테스트하는지, 모킹을 어디까지 하는 게 적당한지를 봅니다. 모킹이 과해져서 테스트가 구현을 그대로 베끼게 되는 흔한 실패도 같이 다룹니다.

마지막으로 테스트가 있어서 리팩터링이 편해지는 경험을 짧게라도 해봅니다.

노트북과 Node 20 이상을 준비해 오세요.`,
    creatorId: 7,
    creatorName: "오지호",
    creatorStudentNumber: "2233",
    lectureStatus: "OPEN",
    capacityByGrade: { "1": 5, "2": 5, "3": 5 },
    totalCapacity: null,
    enrolledCount: 2,
    waitingCount: 0,
    lectureLocation: null,
    lectureDate: shiftDate(15),
    lectureTime: "17:00:00",
    applicationDeadline: `${shiftDate(-4)}T23:59:59`,
    createdAt: `${shiftDate(-12)}T09:10:00`,
  },
];

/** 목 신청자 이름 풀 — 순서가 고정돼야 화면이 매번 똑같이 보입니다. */
const MOCK_APPLICANT_NAMES = [
  "박서준",
  "이도윤",
  "최유나",
  "정민재",
  "한소연",
  "오지호",
  "윤채원",
  "임하준",
  "서지우",
  "노은결",
  "강태윤",
  "문가온",
];

const buildApplicants = (
  lectureId: number,
  count: number,
  offset: number,
): EnrollmentApplicant[] =>
  Array.from(
    { length: Math.min(count, MOCK_APPLICANT_NAMES.length) },
    (_, i) => {
      const index = (offset + i) % MOCK_APPLICANT_NAMES.length;
      return {
        userId: lectureId * 100 + offset + i,
        name: MOCK_APPLICANT_NAMES[index],
        studentNumber: String(2100 + ((lectureId * 7 + index * 13) % 400)),
        requestedAt: `${shiftDate(-(i + 1))}T09:00:00`,
      };
    },
  );

/** 강연 상세의 신청/대기 명단 목 데이터 */
export const getMockEnrollments = (
  lectureId: number,
): LectureEnrollmentsType => {
  const lecture = MOCK_LECTURES.find((l) => l.lectureId === lectureId);

  return {
    lectureId,
    enrolled: buildApplicants(lectureId, lecture?.enrolledCount ?? 0, 0),
    waiting: buildApplicants(lectureId, lecture?.waitingCount ?? 0, 5),
  };
};

/** 마이페이지 목 데이터 — 목 유저(MOCK_USER_ID) 기준으로 뽑아냅니다. */
export const MOCK_MY_LECTURE_ENROLLMENTS: MyLectureEnrollmentsType = {
  createdLectures: MOCK_LECTURES.filter(
    (l) => l.creatorId === MOCK_USER_ID,
  ).map(
    ({
      lectureId,
      title,
      lectureStatus,
      lectureLocation,
      lectureDate,
      lectureTime,
      applicationDeadline,
      createdAt,
    }) => ({
      lectureId,
      title,
      lectureStatus,
      lectureLocation,
      lectureDate,
      lectureTime,
      applicationDeadline: applicationDeadline ?? null,
      createdAt,
    }),
  ),
  enrolledLectures: MOCK_LECTURES.filter((l) => l.creatorId !== MOCK_USER_ID)
    .slice(0, 3)
    .map((lecture, i) => ({
      lectureId: lecture.lectureId,
      title: lecture.title,
      lectureStatus: lecture.lectureStatus,
      enrollmentStatus: i === 2 ? "WAITING" : "ENROLLED",
      creatorName: lecture.creatorName,
      creatorStudentNumber: lecture.creatorStudentNumber,
      lectureLocation: lecture.lectureLocation,
      lectureDate: lecture.lectureDate,
      lectureTime: lecture.lectureTime,
      applicationDeadline: lecture.applicationDeadline ?? null,
      requestedAt: `${shiftDate(-(i + 2))}T09:00:00`,
    })),
};
