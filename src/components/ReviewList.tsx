import { Star, Users } from "lucide-react";
import { Review } from "@/services/types";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewListProps {
  reviews: Review[];
  teamReviews?: Review[];
  showTeamReviews?: boolean;
  teamId?: string | null;
}

const ReviewList = ({ reviews, teamReviews = [], showTeamReviews = false, teamId }: ReviewListProps) => {
  const { user } = useAuth();

  // Check if user is part of the team
  const { data: isTeamMember = false } = useQuery({
    queryKey: ["teamMembership", teamId, user?.id],
    queryFn: async () => {
      if (!user?.id || !teamId) return false;

      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .maybeSingle();

      return !!teamMember;
    },
    enabled: !!user?.id && !!teamId,
  });

  // Filter reviews to show:
  // 1. All public reviews (non-team reviews)
  // 2. Team reviews only if:
  //    - showTeamReviews is true
  //    - user is a team member
  //    - review belongs to the specific team
  //    - review is marked as a team review
  const visibleReviews = [
    ...reviews.filter(review => !review.isTeamReview), // Only include non-team reviews
    ...(showTeamReviews && isTeamMember && teamId ? 
      teamReviews.filter(review => 
        review.teamId === teamId && 
        review.isTeamReview === true
      )
      : []
    )
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (visibleReviews.length === 0) {
    return <p className="text-sm text-gray-500">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {visibleReviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {review.isTeamReview && showTeamReviews && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Team Review
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-2">{review.date}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;