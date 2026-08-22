import ComingSoon from "@/components/ComingSoon";
import Link from "next/link";

export default function InnoLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 space-y-8 pb-8 pt-4"> 
        <Link href="/fll/thinklab/ishikawa" className="btn btn-primary">
          Acessar ThinkLab
        </Link>
        <ComingSoon />
    </div>
  );
}
