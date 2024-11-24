import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanySearchProps {
  searchQuery: string;
  onSearch: (value: string) => void;
}

export const CompanySearch = ({ searchQuery, onSearch }: CompanySearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search companies..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};