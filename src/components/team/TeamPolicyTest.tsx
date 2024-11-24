import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CreateTestTeam } from "./test/CreateTestTeam";
import { CreateTestCompany } from "./test/CreateTestCompany";
import { AddNewMember } from "./test/AddNewMember";
import { VerifyAccess } from "./test/VerifyAccess";

export const TeamPolicyTest = () => {
  const [testTeamId, setTestTeamId] = useState<string | null>(null);
  const [testCompanyId, setTestCompanyId] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState<string | null>(null);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Test Team Member Access</h2>
      <div className="space-y-4">
        <CreateTestTeam 
          onTeamCreated={setTestTeamId}
          disabled={!!testTeamId}
        />

        <CreateTestCompany
          teamId={testTeamId}
          onCompanyCreated={setTestCompanyId}
          disabled={!testTeamId || !!testCompanyId}
        />

        <AddNewMember
          teamId={testTeamId}
          onMemberAdded={setNewMemberId}
          disabled={!testCompanyId || !!newMemberId}
        />

        <VerifyAccess
          companyId={testCompanyId}
          memberId={newMemberId}
          disabled={!newMemberId}
        />
      </div>
    </Card>
  );
};