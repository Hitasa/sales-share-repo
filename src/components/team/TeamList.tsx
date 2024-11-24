import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeamSection } from "./TeamSection";
import { Team } from "@/services/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TeamResponse {
  team: {
    id: string;
    name: string;
    created_at: string;
  };
}

export const TeamList = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data: userTeams, error } = await supabase
        .from("team_members")
        .select(`
          team:teams (
            id,
            name,
            created_at
          )
        `)
        .order("created_at", { foreignTable: "teams", ascending: false });

      if (error) throw error;
      
      // Transform the data to match the Team type
      return (userTeams as any[]).map((item) => ({
        id: item.team.id,
        name: item.team.name,
        created_at: item.team.created_at
      } as Team)).filter((team): team is Team => 
        team !== null && 
        typeof team.id === 'string' && 
        typeof team.name === 'string' && 
        typeof team.created_at === 'string'
      );
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams</h2>
      </div>

      <div className="grid gap-4">
        {selectedTeam ? (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setSelectedTeam(null)}>
              ← Back to Teams
            </Button>
            <TeamSection selectedTeam={selectedTeam} />
          </div>
        ) : (
          <>
            {teams.map((team) => (
              <Card
                key={team.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedTeam(team)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  <Button variant="ghost" onClick={() => setSelectedTeam(team)}>
                    Manage Team
                  </Button>
                </div>
              </Card>
            ))}
            <TeamSection selectedTeam={null} />
          </>
        )}
      </div>
    </div>
  );
};