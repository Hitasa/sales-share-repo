import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { CompanyList } from "@/components/company/CompanyList";
import { CompanySearch } from "@/components/company/CompanySearch";
import { AddCompanyDialog } from "@/components/company/AddCompanyDialog";
import { fetchCompanies, searchCompanies, addCompany } from "@/services/api";

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ["companies", debouncedSearch],
    queryFn: () => debouncedSearch ? searchCompanies(debouncedSearch) : fetchCompanies(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch companies. Please try again.",
      });
    }
  });

  const addCompanyMutation = useMutation({
    mutationFn: (newCompany: any) => addCompany(newCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company added successfully",
      });
    },
  });

  const handleAddCompany = (formData: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => {
    if (!user) return;
    
    const newCompany = {
      ...formData,
      createdBy: user.id,
      sharedWith: [],
    };
    
    addCompanyMutation.mutate(newCompany);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Repositories</h1>
        <AddCompanyDialog onAddCompany={handleAddCompany} />
      </div>

      <CompanySearch 
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <CompanyList companies={companies} />
      )}
    </div>
  );
};

export default Repositories;