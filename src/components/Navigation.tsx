import { Link } from "react-router-dom";
import { Book, ChartLine, Share, User } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Book className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-semibold">SalesRepo</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/repositories"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <Book className="h-4 w-4 mr-2" />
              Repositories
            </Link>
            <Link
              to="/metrics"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <ChartLine className="h-4 w-4 mr-2" />
              Metrics
            </Link>
            <Link
              to="/shared"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <Share className="h-4 w-4 mr-2" />
              Shared
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;