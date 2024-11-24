import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateTestCompanyProps {
  teamId: string | null;
  onCompanyCreated: (companyId: string) => void;
  disabled: boolean;
}

export const CreateTestCompany = ({ teamId, onCompanyCreated, disabled }: CreateTestCompanyProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createTestCompany = async () => {
    if (!teamId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please create a team first",
      });
      return;
    }

    try {
      setIsCreating(true);
      const { data: company, error } = await supabase
        .from("companies")
        .insert([{
          name: "Test Company",
          industry: "Testing",
          team_id: teamId // This is the key fix - ensuring team_id is set
        }])
        .select()
        .single();

      if (error) throw error;
      
      onCompanyCreated(company.id);
      toast({
        title: "Success",
        description: "Test company created successfully",
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
        onClick={createTestCompany}
        disabled={disabled || isCreating || !teamId}
      >
        2. Create Test Company
      </Button>
      {!disabled && <span className="ml-2 text-green-600">✓ Created</span>}
    </div>
  );
};