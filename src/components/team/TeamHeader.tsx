import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Team } from "@/services/types";

interface TeamHeaderProps {
  selectedTeam: Team;
  userRole: string | null;
  onDeleteTeam: () => Promise<void>;
}

export const TeamHeader = ({ selectedTeam, userRole, onDeleteTeam }: TeamHeaderProps) => {
  const isAdmin = userRole === "admin";

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Your role: {userRole || "member"}
        </div>
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Team</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  team and remove all team members.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteTeam}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};