import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyList } from "@/components/company/CompanyList";
import { fetchUserCompanyRepository } from "@/services/api";
import { ManualCompanyDialog } from "@/components/company/ManualCompanyDialog";
import { useState } from "react";
import { Company } from "@/services/types";
import { CompanyProfile } from "@/components/company/CompanyProfile";

const MyRepositories = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["userCompanyRepository", user?.id],
    queryFn: () => fetchUserCompanyRepository(user?.id || ""),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="container mx-auto py-20 px-4">Loading...</div>;
  }

  if (selectedCompany) {
    return (
      <div className="container mx-auto py-20 px-4">
        <CompanyProfile 
          company={selectedCompany} 
          onBack={() => setSelectedCompany(null)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shared Company Repository</h1>
        <ManualCompanyDialog />
      </div>
      <CompanyList 
        companies={companies} 
        isPrivate={false} 
        onCompanySelect={setSelectedCompany}
      />
    </div>
  );
};

export default MyRepositories;