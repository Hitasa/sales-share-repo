import { ManualCompanyDialog } from "@/components/company/ManualCompanyDialog";

export const RepositoryHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Shared Company Repository</h1>
      <ManualCompanyDialog />
    </div>
  );
};