import ApplicantList from "@/components/common/ApplicantList";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import CouncilBadge from "@/components/common/CouncilBadge";
import CreateLectureButton from "@/components/common/CreateLectureButton";
import Input from "@/components/common/Input";
import LectureCard from "@/components/common/LectureCard";

export default function Home() {
  const applicants = [
    { id: "1", name: "학생101", grade: 3, classNum: 3, number: 5 },
    { id: "2", name: "학생102", grade: 2, classNum: 10, number: 17 },
  ];

  const waitings = [
    { id: "1", name: "학생201", grade: 1, classNum: 3, number: 15 },
    { id: "2", name: "학생202", grade: 2, classNum: 10, number: 30 },
  ];

  return (
    <div className="max-w-[1920px] h-screen">
      <div>
        <Input placeholder="강연 제목을 입력하세요" label="강연" />
        <Button variant="primary" className="h-[52px] text-base">
          신청하기
        </Button>
        <Button variant="cancel" className="h-[52px] text-base">
          신청 취소
        </Button>
        <Button variant="waiting" className="h-[52px] text-base">
          대기 신청
        </Button>
        <Button variant="primary" className="h-[38px] text-sm">
          신청하기
        </Button>
        <Button variant="primary" type="submit" className="h-[52px]">
          강연 생성
        </Button>
        <Badge variant="confirmed" />
        <Badge variant="unconfirmed" />
        <Badge variant="pending" />
        <CreateLectureButton />
        <CouncilBadge />
        <LectureCard
          id="1"
          title="파이썬으로 배우는 머신러닝"
          speaker="최데이터"
          status="unconfirmed"
          currentCount={8}
          maxCount={20}
        />
        <LectureCard
          id="2"
          title="React 기초부터 실전까지"
          speaker="김개발"
          status="confirmed"
          currentCount={30}
          maxCount={30}
          waitingCount={5}
        />
        <ApplicantList
          type="applicant"
          currentCount={30}
          maxCount={30}
          applicants={applicants}
        />
        <ApplicantList type="waiting" waitingCount={5} applicants={waitings} />
      </div>
    </div>
  );
}
