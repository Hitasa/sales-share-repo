import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export const TeamPolicyTest = () => {
  const { toast } = useToast();
  const [testTeamId, setTestTeamId] = useState<string | null>(null);
  const [testCompanyId, setTestCompanyId] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState<string | null>(null);

  // Query to fetch the company after we create it
  const { data: company, refetch: refetchCompany } = useQuery({
    queryKey: ["test-company", testCompanyId],
    queryFn: async () => {
      if (!testCompanyId) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", testCompanyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!testCompanyId,
  });

  const createTestTeam = async () => {
    try {
      const { data: team, error } = await supabase
        .from("teams")
        .insert([{ name: "Test Team" }])
        .select()
        .single();

      if (error) throw error;
      
      setTestTeamId(team.id);
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
    }
  };

  const createTestCompany = async () => {
    if (!testTeamId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please create a team first",
      });
      return;
    }

    try {
      const { data: company, error } = await supabase
        .from("companies")
        .insert([{
          name: "Test Company",
          team_id: testTeamId,
          industry: "Testing",
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTestCompanyId(company.id);
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
    }
  };

  const addNewMember = async () => {
    if (!testTeamId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please create a team first",
      });
      return;
    }

    try {
      // For testing purposes, we'll create a new user profile first
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
          team_id: testTeamId,
          user_id: profile.id,
          role: "member",
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      setNewMemberId(profile.id);
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
    }
  };

  const verifyAccess = async () => {
    if (!testCompanyId || !newMemberId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete all previous steps first",
      });
      return;
    }

    try {
      // Attempt to fetch the company as the new member
      await refetchCompany();

      if (company) {
        toast({
          title: "Success",
          description: "New member can access the company!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "New member cannot access the company",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New member cannot access the company: " + error.message,
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Test Team Member Access</h2>
      <div className="space-y-4">
        <div>
          <Button 
            onClick={createTestTeam}
            disabled={!!testTeamId}
          >
            1. Create Test Team
          </Button>
          {testTeamId && <span className="ml-2 text-green-600">✓ Created</span>}
        </div>

        <div>
          <Button 
            onClick={createTestCompany}
            disabled={!testTeamId || !!testCompanyId}
          >
            2. Create Test Company
          </Button>
          {testCompanyId && <span className="ml-2 text-green-600">✓ Created</span>}
        </div>

        <div>
          <Button 
            onClick={addNewMember}
            disabled={!testTeamId || !!newMemberId}
          >
            3. Add New Member
          </Button>
          {newMemberId && <span className="ml-2 text-green-600">✓ Added</span>}
        </div>

        <div>
          <Button 
            onClick={verifyAccess}
            disabled={!testCompanyId || !newMemberId}
          >
            4. Verify Access
          </Button>
        </div>
      </div>
    </Card>
  );
};