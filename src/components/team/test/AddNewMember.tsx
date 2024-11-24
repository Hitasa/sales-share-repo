import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddNewMemberProps {
  teamId: string | null;
  onMemberAdded: (memberId: string) => void;
  disabled: boolean;
}

export const AddNewMember = ({ teamId, onMemberAdded, disabled }: AddNewMemberProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const addNewMember = async () => {
    if (!teamId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please create a team first",
      });
      return;
    }

    try {
      setIsAdding(true);
      // Create a new user profile first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([{
          email: `test${Date.now()}@example.com`,
          first_name: "Test",
          last_name: "User",
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Add the new user to the team
      const { data: member, error: memberError } = await supabase
        .from("team_members")
        .insert([{
          team_id: teamId,
          user_id: profile.id,
          role: "member",
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      onMemberAdded(profile.id);
      toast({
        title: "Success",
        description: "New member added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={addNewMember}
        disabled={disabled || isAdding || !teamId}
      >
        3. Add New Member
      </Button>
      {!disabled && <span className="ml-2 text-green-600">✓ Added</span>}
    </div>
  );
};