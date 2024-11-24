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
import { fetchCompanies, addCompany, searchCompanies, addReview } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', debouncedSearch],
    queryFn: () => debouncedSearch ? searchCompanies(debouncedSearch) : fetchCompanies(),
  });

  const addCompanyMutation = useMutation({
    mutationFn: (newCompany: any) => addCompany(newCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company added to your repository",
      });
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: ({ companyId, review }: { companyId: number; review: { rating: number; comment: string } }) =>
      addReview(companyId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Review added successfully",
      });
      setSelectedCompany(null);
    },
  });

  const handleAddCompany = (formData: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => {
    if (!user) return;
    
    const newCompany = {
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCompany(company.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Reviews
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Reviews for {company.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {company.reviews && company.reviews.length > 0 ? (
                            <ReviewList reviews={company.reviews} />
                          ) : (
                            <p className="text-muted-foreground">No reviews yet.</p>
                          )}
                          {user && (
                            <div className="border-t pt-6">
                              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                              <ReviewForm
                                companyId={company.id}
                                onSubmit={(review) =>
                                  addReviewMutation.mutate({ companyId: company.id, review })
                                }
                              />
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const avgRating = company.reviews?.reduce((acc, review) => acc + review.rating, 0) || 0;
                        const total = company.reviews?.length || 0;
                        toast({
                          description: total > 0 
                            ? `Average rating: ${(avgRating / total).toFixed(1)} / 5.0 (${total} reviews)`
                            : "No ratings yet",
                        });
                      }}
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