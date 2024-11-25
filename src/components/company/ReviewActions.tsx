import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Company } from "@/services/types";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ReviewActionsProps {
  company: Company;
  isTeamView?: boolean;
}

export const ReviewActions = ({ company, isTeamView = false }: ReviewActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isTeamReview, setIsTeamReview] = useState(false);

  // Check if user is part of the company's team
  const { data: isTeamMember = false } = useQuery({
    queryKey: ["teamMembership", company.team_id, user?.id],
    queryFn: async () => {
      if (!user?.id || !company.team_id) return false;

      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", company.team_id)
        .eq("user_id", user.id)
        .maybeSingle();

      return !!teamMember;
    },
    enabled: !!user?.id && !!company.team_id,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (review: { rating: number; comment: string }) => {
      if (!company.id) throw new Error('Company ID is required');

      const newReview = {
        id: crypto.randomUUID(),
        ...review,
        date: new Date().toISOString().split('T')[0],
        isTeamReview: isTeamReview,
      };

      const { data: companyData } = await supabase
        .from('companies')
        .select('reviews, team_reviews, team_id')
        .eq('id', company.id)
        .single();

      let updatedField = {};
      
      if (isTeamReview && company.team_id) {
        const teamReviews = [...(companyData?.team_reviews || []), newReview];
        updatedField = { team_reviews: teamReviews };
      } else {
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
    const publicReviews = company.reviews || [];
    const teamReviews = isTeamMember ? (company.team_reviews || []) : [];
    const allReviews = [...publicReviews, ...teamReviews];
    
    if (!allReviews || allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / allReviews.length;
  };

  const averageRating = calculateAverageRating();
  const publicReviews = company.reviews || [];
  const teamReviews = company.team_reviews || [];

  return (
    <div className="flex items-center space-x-2">
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
            <ReviewList 
              reviews={publicReviews} 
              teamReviews={teamReviews}
              showTeamReviews={isTeamMember}
            />
            {user && (
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Write a Review
                  </h3>
                  {isTeamView && isTeamMember && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTeamReview(!isTeamReview)}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {isTeamReview ? 'Switch to Public Review' : 'Switch to Team Review'}
                    </Button>
                  )}
                </div>
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
          ({publicReviews.length + (isTeamMember ? teamReviews.length : 0)})
        </span>
      </div>
    </div>
  );
};