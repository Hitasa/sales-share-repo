import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCompanies } from "./ProjectCompanies";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectNotes } from "./ProjectNotes";
import { AddCompanyToProjectDialog } from "./AddCompanyToProjectDialog";

interface Note {
  content: string;
  created_at: string;
}

interface ProjectProfileProps {
  project: {
    id: string;
    name: string;
    description?: string;
    notes?: string;
    notes_list?: Note[];
    team_id?: string | null;
  };
  companies?: any[];
  isLoadingCompanies?: boolean;
  onBack?: () => void;
  onAddCompany: (company: any) => void;
  onRemoveCompany: (companyId: string) => void;
}

export const ProjectProfile = ({
  project,
  companies,
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

  const addNoteMutation = useMutation({
    mutationFn: async (noteContent: string) => {
      const newNote = {
        content: noteContent,
        created_at: new Date().toISOString(),
      };
      
      const currentNotesList = editedProject.notes_list || [];
      const updatedNotesList = [...currentNotesList, newNote];
      
      const { error } = await supabase
        .from("projects")
        .update({ notes_list: updatedNotesList })
        .eq("id", project.id);
      
      if (error) throw error;
      return updatedNotesList;
    },
    onSuccess: (updatedNotesList) => {
      setEditedProject({ ...editedProject, notes_list: updatedNotesList });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add note",
      });
    },
  });

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <ProjectHeader
          name={editedProject.name}
          description={editedProject.description}
          isEditing={isEditing}
          onBack={() => onBack?.()}
          onEdit={() => setIsEditing(!isEditing)}
          onNameChange={(name) => setEditedProject({ ...editedProject, name })}
          onDescriptionChange={(description) => setEditedProject({ ...editedProject, description })}
        />

        {isEditing && (
          <CardContent className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateProjectMutation.mutate(editedProject)}>
              Save Changes
            </Button>
          </CardContent>
        )}

        <CardContent className="space-y-6">
          <ProjectNotes
            notes={editedProject.notes_list || []}
            onAddNote={(content) => addNoteMutation.mutate(content)}
          />

          <div className="pt-6">
            <ProjectCompanies
              companies={companies}
              isLoading={isLoadingCompanies}
              isAddCompanyDialogOpen={isAddCompanyDialogOpen}
              onOpenChange={setIsAddCompanyDialogOpen}
              onAddCompany={onAddCompany}
              onRemoveCompany={onRemoveCompany}
            />
          </div>
        </CardContent>
      </Card>

      <AddCompanyToProjectDialog
        projectId={project.id}
        teamId={project.team_id}
        isOpen={isAddCompanyDialogOpen}
        onOpenChange={setIsAddCompanyDialogOpen}
        onAddCompany={(company) => {
          onAddCompany(company);
          setIsAddCompanyDialogOpen(false);
        }}
      />
    </div>
  );
};