import { LotRoom } from "./LotRoom";

export const instant = false;

export default async function LotPage({ params }: PageProps<"/lots/[id]">) {
  const { id } = await params;
  return <LotRoom id={id} />;
}
