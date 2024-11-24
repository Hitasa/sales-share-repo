import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CompanyDetailsSection } from "./CompanyDetailsSection";
import { CompanyCommentsSection } from "./CompanyCommentsSection";
import ReviewList from "../ReviewList";
import ReviewForm from "../ReviewForm";
import { Company } from "@/services/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompany } from "@/services/api";

interface CompanyProfileProps {
  company: Company;
}

export const CompanyProfile = ({ company: initialCompany }: CompanyProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(initialCompany);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCompanyMutation = useMutation({
    mutationFn: (updates: Partial<Company>) => updateCompany(initialCompany.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanies"] });
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

    const updatedComments = [
      ...(editedCompany.comments || []),
      {
        id: Date.now(),
        text: newComment,
        createdAt: new Date().toISOString(),
      },
    ];

    updateCompanyMutation.mutate({
      ...editedCompany,
      comments: updatedComments,
    });

    setNewComment("");
  };

  const handleAddReview = (review: { rating: number; comment: string }) => {
    const newReview = {
      id: Date.now(),
      ...review,
      date: new Date().toISOString().split('T')[0],
    };

    updateCompanyMutation.mutate({
      ...editedCompany,
      reviews: [...(editedCompany.reviews || []), newReview],
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CompanyDetailsSection
          company={initialCompany}
          editedCompany={editedCompany}
          isEditing={isEditing}
          setEditedCompany={setEditedCompany}
          setIsEditing={setIsEditing}
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