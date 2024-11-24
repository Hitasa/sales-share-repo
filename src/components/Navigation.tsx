import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TeamInvitationNotifications } from "./notifications/TeamInvitationNotifications";

const Navigation = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "You have been logged out successfully",
      });
      // After successful logout, redirect to login page
      navigate("/auth/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to log out. Please try again.",
      });
    }
  };

  // Don't render navigation if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2 text-sm font-medium">
              Home
            </Link>
            <Link
              to="/repositories"
              className="flex items-center px-2 py-2 text-sm font-medium"
            >
              Repositories
            </Link>
            <Link
              to="/my-repositories"
              className="flex items-center px-2 py-2 text-sm font-medium"
            >
              My Repositories
            </Link>
            <Link
              to="/team-repositories"
              className="flex items-center px-2 py-2 text-sm font-medium"
            >
              Team Repositories
            </Link>
            <Link
              to="/projects"
              className="flex items-center px-2 py-2 text-sm font-medium"
            >
              Projects
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <TeamInvitationNotifications />
              <Link to="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;