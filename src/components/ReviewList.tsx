import { Star, Users } from "lucide-react";
import { Review } from "@/services/types";
import { Badge } from "@/components/ui/badge";

interface ReviewListProps {
  reviews: Review[];
  teamReviews?: Review[];
  showTeamReviews?: boolean;
}

const ReviewList = ({ reviews, teamReviews = [], showTeamReviews = false }: ReviewListProps) => {
  // Only include team reviews if showTeamReviews is true and mark them as team reviews
  const visibleReviews = [
    ...reviews,
    ...(showTeamReviews ? teamReviews.map(review => ({ ...review, isTeamReview: true })) : [])
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