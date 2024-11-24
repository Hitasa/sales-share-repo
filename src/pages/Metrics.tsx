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
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Mock data with reviews
const companies = [
  {
    id: 1,
    name: "Acme Corp",
    industry: "Technology",
    salesVolume: "$1.2M",
    growth: "+15%",
    reviews: [
      {
        id: 1,
        rating: 4,
        comment: "Great company to work with!",
        date: "2024-02-20",
      },
    ],
  },
  {
    id: 2,
    name: "Beta Industries",
    industry: "Manufacturing",
    salesVolume: "$850K",
    growth: "+8%",
    reviews: [],
  },
  {
    id: 3,
    name: "Gamma Solutions",
    industry: "Services",
    salesVolume: "$2.1M",
    growth: "+22%",
    reviews: [],
  },
];

const Metrics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localCompanies, setLocalCompanies] = useState(companies);

  const filteredCompanies = localCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReviewSubmit = (companyId: number, review: { rating: number; comment: string }) => {
    setLocalCompanies((prevCompanies) =>
      prevCompanies.map((company) =>
        company.id === companyId
          ? {
              ...company,
              reviews: [
                ...company.reviews,
                {
                  id: Date.now(),
                  ...review,
                  date: new Date().toISOString().split("T")[0],
                },
              ],
            }
          : company
      )
    );
  };

  const getAverageRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

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
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>{company.salesVolume}</TableCell>
                <TableCell className="text-green-600">{company.growth}</TableCell>
                <TableCell>{getAverageRating(company.reviews)} ⭐</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Reviews
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{company.name} - Reviews</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <ReviewForm
                          companyId={company.id}
                          onSubmit={(review) => handleReviewSubmit(company.id, review)}
                        />
                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-4">Previous Reviews</h3>
                          <ReviewList reviews={company.reviews} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Metrics;