'use client';
import { useRouter } from "next/navigation";

export default function UserPublicPage({params}: {params: {username: string}}) {
  const { username } = params;
  const router = useRouter();
  return (
    <div>
      User Public Page: {username}
      <button onClick={() => router.back()}>Go Home</button>
    </div>
  );
}