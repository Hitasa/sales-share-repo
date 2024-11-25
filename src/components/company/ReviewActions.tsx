import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Company } from "@/services/types";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { supabase } from "@/integrations/supabase/client";

interface ReviewActionsProps {
  company: Company;
  isTeamView?: boolean;
}

export const ReviewActions = ({ company, isTeamView = false }: ReviewActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addReviewMutation = useMutation({
    mutationFn: async (review: { rating: number; comment: string }) => {
      if (!company.id) throw new Error('Company ID is required');

      const newReview = {
        id: crypto.randomUUID(),
        ...review,
        date: new Date().toISOString().split('T')[0],
      };

      const { data: companyData } = await supabase
        .from('companies')
        .select('reviews, team_reviews, team_id')
        .eq('id', company.id)
        .single();

      let updatedField = {};
      
      // If viewing from team repository or company belongs to a team, add to team_reviews
      if (isTeamView || company.team_id) {
        const teamReviews = [...(companyData?.team_reviews || []), newReview];
        updatedField = { team_reviews: teamReviews };
      } else {
        // Otherwise, add to regular reviews
        const reviews = [...(companyData?.reviews || []), newReview];
        updatedField = { reviews };
      }

      const { error } = await supabase
        .from('companies')
        .update(updatedField)
        .eq('id', company.id);

      if (error) throw error;
      return { ...company, ...updatedField };
    },
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
    const allReviews = [
      ...(company.reviews || []),
      ...(company.team_reviews || [])
    ];
    
    if (!allReviews || allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / allReviews.length;
  };

  const averageRating = calculateAverageRating();
  const allReviews = [...(company.reviews || []), ...(company.team_reviews || [])];

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
            {allReviews.length > 0 ? (
              <ReviewList reviews={allReviews} />
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
            {user && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Write a {isTeamView ? 'Team ' : ''}Review
                </h3>
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
          ({allReviews.length || 0})
        </span>
      </div>
    </>
  );
};