import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Company } from "@/services/types";
import { addReview } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";

interface ReviewActionsProps {
  company: Company;
}

export const ReviewActions = ({ company }: ReviewActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addReviewMutation = useMutation({
    mutationFn: (review: { rating: number; comment: string }) => 
      addReview(company.id, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add review",
      });
    },
  });

  const calculateAverageRating = () => {
    if (!company.reviews || company.reviews.length === 0) return 0;
    const sum = company.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / company.reviews.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <>
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
                  onSubmit={(review) => addReviewMutation.mutate(review)} 
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= averageRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({company.reviews?.length || 0})
        </span>
      </div>
    </>
  );
};