import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyList } from "@/components/company/CompanyList";
import { fetchUserCompanyRepository } from "@/services/api";
import { ManualCompanyDialog } from "@/components/company/ManualCompanyDialog";
import { useState } from "react";
import { Company } from "@/services/types";
import { CompanyProfile } from "@/components/company/CompanyProfile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MyRepositories = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["userCompanyRepository", user?.id],
    queryFn: () => fetchUserCompanyRepository(user?.id || ""),
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("created_by", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToProjectMutation = useMutation({
    mutationFn: async ({ companyId, projectId }: { companyId: string; projectId: string }) => {
      const { error } = await supabase
        .from("project_companies")
        .insert([{ project_id: projectId, company_id: companyId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      setIsProjectDialogOpen(false);
      toast({
        title: "Success",
        description: "Company added to project successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add company to project",
      });
    },
  });

  const handleAddToProject = (company: Company) => {
    if (!selectedProjectId) return;
    addToProjectMutation.mutate({ 
      companyId: company.id, 
      projectId: selectedProjectId 
    });
  };

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

  const renderProjectDialog = (company: Company) => (
    <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusSquare className="h-4 w-4 mr-1" />
          Add to Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setSelectedProjectId(project.id);
                handleAddToProject(company);
              }}
            >
              {project.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

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
        additionalActions={renderProjectDialog}
      />
    </div>
  );
};

export default MyRepositories;