import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyDetailsSection } from "./CompanyDetailsSection";
import { CompanyCommentsSection } from "./CompanyCommentsSection";
import ReviewList from "../ReviewList";
import ReviewForm from "../ReviewForm";
import { Company, Comment, Review } from "@/services/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { updateCompany } from "@/services/api";
import { ArrowLeft } from "lucide-react";

interface CompanyProfileProps {
  company: Company;
  onBack?: () => void;
}

export const CompanyProfile = ({ company: initialCompany, onBack }: CompanyProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(initialCompany);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const calculateAverageRating = (reviews: { rating: number }[] = []) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const updateCompanyMutation = useMutation({
    mutationFn: (updates: Partial<Company>) => updateCompany(initialCompany.id, updates),
    onSuccess: (updatedCompany) => {
      setEditedCompany(updatedCompany);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    },
  });

  const handleSave = () => {
    updateCompanyMutation.mutate(editedCompany);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: crypto.randomUUID(),
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [
      ...(editedCompany.comments || []),
      newCommentObj,
    ];

    updateCompanyMutation.mutate({
      ...editedCompany,
      comments: updatedComments,
    });
    setNewComment("");
  };

  const handleAddReview = (review: { rating: number; comment: string }) => {
    const newReview: Review = {
      id: crypto.randomUUID(),
      ...review,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedReviews = [...(editedCompany.reviews || []), newReview];
    
    updateCompanyMutation.mutate({
      ...editedCompany,
      reviews: updatedReviews,
      averageRating: calculateAverageRating(updatedReviews),
    });
  };

  const averageRating = calculateAverageRating(editedCompany.reviews);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Repository
        </Button>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CompanyDetailsSection
          company={editedCompany}
          editedCompany={editedCompany}
          isEditing={isEditing}
          setEditedCompany={setEditedCompany}
          setIsEditing={setIsEditing}
          averageRating={averageRating}
        />

        {isEditing && (
          <CardContent className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        )}

        <CardContent className="border-t pt-6">
          <CardTitle className="mb-4">Reviews</CardTitle>
          <div className="space-y-6">
            <ReviewForm companyId={initialCompany.id} onSubmit={handleAddReview} />
            {editedCompany.reviews && editedCompany.reviews.length > 0 && (
              <ReviewList reviews={editedCompany.reviews} />
            )}
          </div>
        </CardContent>

        <CompanyCommentsSection
          editedCompany={editedCompany}
          newComment={newComment}
          setNewComment={setNewComment}
          onAddComment={handleAddComment}
        />
      </Card>
    </div>
  );
};