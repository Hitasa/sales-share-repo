import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserCompanies, addCompany } from "@/services/api";
import { Card } from "./ui/card";
import { CompanyProfile } from "./company/CompanyProfile";
import { AddCompanyForm } from "./AddCompanyForm";
import { useToast } from "@/hooks/use-toast";

export const UserCompanies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["userCompanies", user?.id],
    queryFn: () => fetchUserCompanies(user?.id || ""),
    enabled: !!user,
  });

  const createCompanyMutation = useMutation({
    mutationFn: (companyData: { name: string; industry: string; salesVolume: string; growth: string }) =>
      addCompany({ ...companyData, createdBy: user?.id || "", sharedWith: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanies"] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <AddCompanyForm onSubmit={(data) => createCompanyMutation.mutate(data)} />
        </Card>
      </div>
    );
  }

  return <CompanyProfile company={companies[0]} />;
};