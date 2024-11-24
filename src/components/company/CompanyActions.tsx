import { Button } from "@/components/ui/button";
import { PlusSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToUserRepository, removeFromUserRepository } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Company } from "@/services/types";
import { ProjectActions } from "./ProjectActions";
import { ReviewActions } from "./ReviewActions";

interface CompanyActionsProps {
  company: Company;
  isPrivate?: boolean;
  projectId?: string;
}

export const CompanyActions = ({ company, isPrivate = false, projectId }: CompanyActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addToRepositoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !company) {
        throw new Error("Missing required information");
      }
      await addToUserRepository(company.id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: `${company.name} added to your repository`,
      });
    },
    onError: (error) => {
      console.error("Error adding to repository:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add company to repository",
      });
    },
  });

  const removeFromRepositoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !company.id) {
        throw new Error("Missing required information");
      }
      await removeFromUserRepository(company.id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: `${company.name} removed from your repository`,
      });
    },
    onError: (error) => {
      console.error("Error removing from repository:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove company from repository",
      });
    },
  });

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => removeFromRepositoryMutation.mutate()}
        disabled={removeFromRepositoryMutation.isPending}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {removeFromRepositoryMutation.isPending ? "Removing..." : "Remove"}
      </Button>
      <ProjectActions company={company} projectId={projectId} />
      <ReviewActions company={company} />
    </div>
  );
};