import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateTestTeamProps {
  onTeamCreated: (teamId: string) => void;
  disabled: boolean;
}

export const CreateTestTeam = ({ onTeamCreated, disabled }: CreateTestTeamProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createTestTeam = async () => {
    try {
      setIsCreating(true);
      const { data: team, error } = await supabase
        .from("teams")
        .insert([{ name: "Test Team" }])
        .select()
        .single();

      if (error) throw error;
      
      onTeamCreated(team.id);
      toast({
        title: "Success",
        description: "Test team created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={createTestTeam}
        disabled={disabled || isCreating}
      >
        1. Create Test Team
      </Button>
      {!disabled && <span className="ml-2 text-green-600">✓ Created</span>}
    </div>
  );
};