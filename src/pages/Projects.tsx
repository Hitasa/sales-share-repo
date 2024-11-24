import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CompanyList } from "@/components/company/CompanyList";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
});

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: projectCompanies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["project-companies", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      
      // First get the company IDs in the project
      const { data: projectCompanyIds } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", selectedProject);

      if (!projectCompanyIds || projectCompanyIds.length === 0) return [];

      // Then get the actual companies
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .in("id", projectCompanyIds.map(pc => pc.company_id));

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject,
  });

  const { data: availableCompanies } = useQuery({
    queryKey: ["available-companies", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];

      // First get the company IDs in the project
      const { data: projectCompanyIds } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", selectedProject);

      const excludedIds = projectCompanyIds?.map(pc => pc.company_id) || [];

      // If there are no companies in the project, just get all companies
      if (excludedIds.length === 0) {
        const { data, error } = await supabase
          .from("companies")
          .select("*");
        
        if (error) throw error;
        return data;
      }

      // Otherwise, get companies not in the project
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .not("id", "in", `(${excludedIds.join(",")})`);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject && isAddCompanyDialogOpen,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema>) => {
      const { error } = await supabase
        .from("projects")
        .insert([{ name: values.name, created_by: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      form.reset();
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
  });

  const addCompanyToProjectMutation = useMutation({
    mutationFn: async (companyId: string) => {
      if (!selectedProject) return;
      const { error } = await supabase
        .from("project_companies")
        .insert([{ project_id: selectedProject, company_id: companyId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      queryClient.invalidateQueries({ queryKey: ["available-companies"] });
      setIsAddCompanyDialogOpen(false);
      toast({
        title: "Success",
        description: "Company added to project successfully",
      });
    },
  });

  const removeCompanyFromProjectMutation = useMutation({
    mutationFn: async (companyId: string) => {
      if (!selectedProject) return;
      const { error } = await supabase
        .from("project_companies")
        .delete()
        .eq("project_id", selectedProject)
        .eq("company_id", companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      queryClient.invalidateQueries({ queryKey: ["available-companies"] });
      toast({
        title: "Success",
        description: "Company removed from project successfully",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    createProjectMutation.mutate(values);
  };

  if (isLoadingProjects) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Create Project</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project List</h2>
          {projects?.map((project) => (
            <Card
              key={project.id}
              className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                selectedProject === project.id ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className="flex justify-between items-center">
                <span>{project.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProjectMutation.mutate(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {selectedProject && (
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Companies</h2>
              <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Company</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Add Company to Project</DialogTitle>
                  </DialogHeader>
                  {availableCompanies && (
                    <CompanyList
                      companies={availableCompanies}
                      onCompanySelect={(company) => {
                        addCompanyToProjectMutation.mutate(company.id);
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoadingCompanies ? (
              <div>Loading companies...</div>
            ) : projectCompanies && projectCompanies.length > 0 ? (
              <CompanyList
                companies={projectCompanies}
                additionalActions={(company) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCompanyFromProjectMutation.mutate(company.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              />
            ) : (
              <Card className="p-4">
                <p className="text-center text-muted-foreground">
                  No companies added to this project yet.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
