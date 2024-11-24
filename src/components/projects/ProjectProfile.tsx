import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCompanies } from "./ProjectCompanies";

interface ProjectProfileProps {
  project: {
    id: string;
    name: string;
    description?: string;
    notes?: string;
  };
  companies?: any[];
  availableCompanies?: any[];
  isLoadingCompanies?: boolean;
  onBack?: () => void;
  onAddCompany: (company: any) => void;
  onRemoveCompany: (companyId: string) => void;
}

export const ProjectProfile = ({
  project,
  companies,
  availableCompanies,
  isLoadingCompanies,
  onBack,
  onAddCompany,
  onRemoveCompany,
}: ProjectProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: async (updates: typeof editedProject) => {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", project.id);
      
      if (error) throw error;
      return { ...project, ...updates };
    },
    onSuccess: (updatedProject) => {
      setEditedProject(updatedProject);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
      });
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {isEditing ? (
                  <Input
                    value={editedProject.name}
                    onChange={(e) =>
                      setEditedProject({ ...editedProject, name: e.target.value })
                    }
                    className="text-2xl font-bold"
                  />
                ) : (
                  project.name
                )}
              </CardTitle>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Project"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editedProject.description || ""}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, description: e.target.value })
                }
                placeholder="Add a description..."
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={editedProject.notes || ""}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, notes: e.target.value })
                }
                placeholder="Add notes..."
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={() => updateProjectMutation.mutate(editedProject)}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="pt-6">
            <ProjectCompanies
              companies={companies}
              availableCompanies={availableCompanies}
              isLoading={isLoadingCompanies}
              isAddCompanyDialogOpen={isAddCompanyDialogOpen}
              onOpenChange={setIsAddCompanyDialogOpen}
              onAddCompany={onAddCompany}
              onRemoveCompany={onRemoveCompany}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};