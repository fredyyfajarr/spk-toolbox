import { AlternativesPage } from "@/components/alternatives/AlternativesPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AlternativesPage projectId={id} />;
}
