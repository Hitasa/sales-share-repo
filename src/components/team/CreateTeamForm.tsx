import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTeamFormProps {
  onCancel: () => void;
}

export const CreateTeamForm = ({ onCancel }: CreateTeamFormProps) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a team name",
      });
      return;
    }

    try {
      setIsCreating(true);
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([{ name: newTeamName }])
        .select()
        .single();

      if (teamError) throw teamError;

      // Invalidate and refetch teams query
      await queryClient.invalidateQueries({ queryKey: ["teams"] });

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      onCancel();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={newTeamName}
        onChange={(e) => setNewTeamName(e.target.value)}
        placeholder="Team name"
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button onClick={handleCreateTeam} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Team"}
      </Button>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};