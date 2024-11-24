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
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([{ name: newTeamName }])
        .select()
        .single();

      if (teamError) throw teamError;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      // Invalidate the teams query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      onCancel();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team",
      });
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
      <Button onClick={handleCreateTeam}>Create Team</Button>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};