import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCompanies } from "./ProjectCompanies";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

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
  const [newNote, setNewNote] = useState("");
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
      const newNoteObj = {
        content: noteContent,
        created_at: new Date().toISOString(),
      };
      
      const currentNotesList = editedProject.notes_list || [];
      const updatedNotesList = [...currentNotesList, newNoteObj];
      
      const { error } = await supabase
        .from("projects")
        .update({ notes_list: updatedNotesList })
        .eq("id", project.id);
      
      if (error) throw error;
      return updatedNotesList;
    },
    onSuccess: (updatedNotesList) => {
      setEditedProject({ ...editedProject, notes_list: updatedNotesList });
      setNewNote("");
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

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

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {(editedProject.description || isEditing) && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <Input
                  value={editedProject.description || ""}
                  onChange={(e) =>
                    setEditedProject({ ...editedProject, description: e.target.value })
                  }
                  placeholder="Add a description..."
                  disabled={!isEditing}
                />
              </Card>
            )}

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={() => updateProjectMutation.mutate(editedProject)}>
                  Save Changes
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-4">Notes</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a new note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleAddNote}
                      className="self-end"
                    >
                      Add Note
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[300px] w-full mt-4">
                    <div className="space-y-4">
                      {editedProject.notes_list?.map((note, index) => (
                        <Card key={index} className="p-4">
                          <p className="text-sm text-gray-600 mb-2">
                            {format(new Date(note.created_at), "PPp")}
                          </p>
                          <p className="text-gray-900">{note.content}</p>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </div>
          </div>

          <div className="pt-6">
            <ProjectCompanies
              companies={companies}
              availableCompanies={availableCompanies}
              isLoading={isLoadingCompanies}
              isAddCompanyDialogOpen={false}
              onOpenChange={() => {}}
              onAddCompany={onAddCompany}
              onRemoveCompany={onRemoveCompany}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};