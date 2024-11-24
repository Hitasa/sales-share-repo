import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star, PlusSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToUserRepository } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { Company } from "@/services/types";

interface CompanyActionsProps {
  company: Company;
  isPrivate?: boolean;
}

export const CompanyActions = ({ company, isPrivate = false }: CompanyActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addToRepositoryMutation = useMutation({
    mutationFn: () => addToUserRepository(company.id, user?.id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company added to your repository",
      });
    },
  });

  return (
    <div className="flex space-x-2">
      {!isPrivate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => addToRepositoryMutation.mutate()}
        >
          <PlusSquare className="h-4 w-4 mr-1" />
          Add
        </Button>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
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
                    addToRepositoryMutation.mutate()
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
  );
};