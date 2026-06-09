import { CriteriaPage } from "@/components/criteria/CriteriaPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CriteriaPage projectId={id} />;
}
