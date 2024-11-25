import { Button } from "@/components/ui/button";
import { PlusSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addToUserRepository, removeFromUserRepository } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Company } from "@/services/types";
import { ProjectActions } from "./ProjectActions";
import { ReviewActions } from "./ReviewActions";
import { TeamShareDialog } from "../team/TeamShareDialog";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";

interface TeamResponse {
  team: Team;
}

interface CompanyActionsProps {
  company: Company;
  isPrivate?: boolean;
  projectId?: string;
}

export const CompanyActions = ({ company, isPrivate = false, projectId }: CompanyActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userTeams = [] } = useQuery({
    queryKey: ["userTeams", user?.id],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from("team_members")
        .select("team:teams(id, name)")
        .eq("user_id", user?.id);

      if (error) throw error;
      
      return (teamMembers as unknown as TeamResponse[])
        .map(member => ({
          id: member.team.id,
          name: member.team.name
        }));
    },
    enabled: !!user,
  });

  const addToRepositoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !company) {
        throw new Error("Missing required information");
      }

      // First check if company exists
      const { data: existingCompany, error: checkError } = await supabase
        .from("companies")
        .select("id")
        .eq("id", company.id)
        .maybeSingle();

      if (checkError) throw checkError;

      // If company doesn't exist, create it
      if (!existingCompany) {
        const { error: insertError } = await supabase
          .from("companies")
          .insert([{
            id: company.id,
            name: company.name,
            industry: company.industry,
            sales_volume: company.salesVolume,
            growth: company.growth,
            website: company.website,
            phone_number: company.phoneNumber,
            email: company.email,
            created_by: user.id
          }]);

        if (insertError) {
          console.error("Error creating company:", insertError);
          throw new Error("Failed to create company");
        }
      }

      // Now add to repository
      const { error: repoError } = await supabase
        .from("company_repositories")
        .insert([{
          company_id: company.id,
          user_id: user.id
        }]);

      if (repoError) {
        // Check if it's a unique violation (company already in repository)
        if (repoError.code === "23505") {
          throw new Error("Company is already in your repository");
        }
        throw repoError;
      }
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

  const linkToTeamMutation = useMutation({
    mutationFn: async ({ companyId, teamId }: { companyId: string; teamId: string }) => {
      const { error } = await supabase
        .from("companies")
        .update({ team_id: teamId })
        .eq("id", companyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company linked to team successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to link company to team",
      });
    },
  });

  const removeFromRepositoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !company.id) {
        throw new Error("Missing required information");
      }
      const { error } = await supabase
        .from("company_repositories")
        .delete()
        .eq("company_id", company.id)
        .eq("user_id", user.id);

      if (error) throw error;
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

  const handleTeamSelect = (teamId: string) => {
    linkToTeamMutation.mutate({
      companyId: company.id,
      teamId,
    });
  };

  const isTeamRepository = company.team_id !== null && company.team_id !== undefined;

  return (
    <div className="flex space-x-2">
      {!isPrivate ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToRepositoryMutation.mutate()}
            disabled={addToRepositoryMutation.isPending}
          >
            <PlusSquare className="h-4 w-4 mr-1" />
            {addToRepositoryMutation.isPending ? "Adding..." : "Add"}
          </Button>
          <ReviewActions company={company} />
        </>
      ) : (
        <>
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
          {!isTeamRepository && <TeamShareDialog teams={userTeams} onTeamSelect={handleTeamSelect} />}
        </>
      )}
      {isTeamRepository && <ProjectActions company={company} projectId={projectId} />}
    </div>
  );
};