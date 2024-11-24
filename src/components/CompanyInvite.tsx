import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteUserToCompany } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface CompanyInviteProps {
  companyId: number;
  onInviteSuccess: () => void;
}

export const CompanyInvite = ({ companyId, onInviteSuccess }: CompanyInviteProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const { toast } = useToast();

  const handleInvite = async () => {
    try {
      await inviteUserToCompany(companyId, email, role);
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });
      setEmail("");
      onInviteSuccess();
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h4 className="font-semibold">Invite Team Member</h4>
      <div className="flex gap-2">
        <Input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select value={role} onValueChange={(value: "admin" | "member") => setRole(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleInvite} size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>
    </div>
  );
};