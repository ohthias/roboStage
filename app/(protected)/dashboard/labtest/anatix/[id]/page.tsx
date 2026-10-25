import { notFound } from "next/navigation";
import { AnatixLabView } from "@/components/labtest/anatix/AnatixLabView";
import { getAnatixLab } from "../actions";

export default async function AnatixLabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const data = await getAnatixLab(id).catch(() => null);
  if (!data) notFound();

  return <AnatixLabView lab={data.lab} sessions={data.sessions} />;
}
