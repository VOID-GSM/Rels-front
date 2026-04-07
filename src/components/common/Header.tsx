import { ROLE } from "@/constants/roleTypes";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const isCouncil = ROLE.COUNCIL;
  return (
    <header className="max-w-[1920px] h-[70px] border-b border-main-300 flex items-center justify-between px-50">
      <Image src="/img/Rels.png" alt="logo" width={50} height={50} />
      <div>
        {isCouncil && (
          <Link href="/notification" className="font-medium mr-10">
            공지 작성
          </Link>
        )}
        <Link href="/mypage" className="font-medium">
          마이페이지
        </Link>
      </div>
    </header>
  );
}
