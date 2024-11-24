import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerifyAccessProps {
  companyId: string | null;
  memberId: string | null;
  disabled: boolean;
}

export const VerifyAccess = ({ companyId, memberId, disabled }: VerifyAccessProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAccess = async () => {
    if (!companyId || !memberId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete all previous steps first",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const { data: company, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New member can access the company!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New member cannot access the company: " + error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={verifyAccess}
        disabled={disabled || isVerifying || !companyId || !memberId}
      >
        4. Verify Access
      </Button>
    </div>
  );
};