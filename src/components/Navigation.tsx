import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2 text-sm font-medium">
              Home
            </Link>
            {user && (
              <>
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
              </>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
                <Button variant="ghost" onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;