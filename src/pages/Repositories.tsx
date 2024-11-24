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
import { Search, PlusSquare, MessageSquare, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddCompanyForm } from "@/components/AddCompanyForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCompanies, addCompany, searchCompanies, Company } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', debouncedSearch],
    queryFn: () => debouncedSearch ? searchCompanies(debouncedSearch) : fetchCompanies(),
  });

  const addCompanyMutation = useMutation({
    mutationFn: (newCompany: Omit<Company, "id">) => addCompany(newCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company added to your repository",
      });
    },
  });

  const handleAddCompany = (formData: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => {
    if (!user) return;
    
    const newCompany: Omit<Company, "id"> = {
      ...formData,
      createdBy: user.id,
      sharedWith: [],
    };
    
    addCompanyMutation.mutate(newCompany);
  };

  const handleAddToRepository = (company: Company) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add companies to your repository",
        variant: "destructive",
      });
      return;
    }
    
    handleAddCompany({
      name: company.name,
      industry: company.industry || "N/A",
      salesVolume: company.salesVolume || "N/A",
      growth: company.growth || "N/A",
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  if (isLoading) {
    return <div className="container mx-auto py-20 px-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Repositories</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusSquare className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <AddCompanyForm onSubmit={handleAddCompany} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">
                  {company.link ? (
                    <a
                      href={company.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {company.name}
                    </a>
                  ) : (
                    company.name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToRepository(company)}
                    >
                      <PlusSquare className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        description: "Reviews feature coming soon",
                      })}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reviews
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        description: "Ratings feature coming soon",
                      })}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Ratings
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Repositories;