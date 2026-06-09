import { ResultPage } from "@/components/result/ResultPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultPage projectId={id} />;
}
