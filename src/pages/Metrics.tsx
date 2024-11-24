import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

// Mock data - in a real app, this would come from an API
const companies = [
  { id: 1, name: "Acme Corp", industry: "Technology", salesVolume: "$1.2M", growth: "+15%" },
  { id: 2, name: "Beta Industries", industry: "Manufacturing", salesVolume: "$850K", growth: "+8%" },
  { id: 3, name: "Gamma Solutions", industry: "Services", salesVolume: "$2.1M", growth: "+22%" },
  // Add more mock companies as needed
];

const Metrics = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">Company Metrics</h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Sales Volume</TableHead>
              <TableHead>Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>{company.salesVolume}</TableCell>
                <TableCell className="text-green-600">{company.growth}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Metrics;