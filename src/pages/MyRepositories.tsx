import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CompanyList } from "@/components/company/CompanyList";
import { fetchUserCompanyRepository } from "@/services/api";

const MyRepositories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["userCompanyRepository", user?.id],
    queryFn: () => fetchUserCompanyRepository(user?.id || ""),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="container mx-auto py-20 px-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Company Repository</h1>
      </div>
      <CompanyList companies={companies} isPrivate={true} />
    </div>
  );
};

export default MyRepositories;