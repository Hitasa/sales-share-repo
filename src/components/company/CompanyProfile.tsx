import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyDetailsSection } from "./CompanyDetailsSection";
import { CompanyCommentsSection } from "./CompanyCommentsSection";
import ReviewList from "../ReviewList";
import ReviewForm from "../ReviewForm";
import { Company, Comment, Review } from "@/services/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCompany } from "@/services/api";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CompanyProfileProps {
  company: Company;
  onBack?: () => void;
}

export const CompanyProfile = ({ company: initialCompany, onBack }: CompanyProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(initialCompany);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if user is part of the company's team
  const { data: isTeamMember = false } = useQuery({
    queryKey: ["teamMembership", initialCompany.team_id, user?.id],
    queryFn: async () => {
      if (!user?.id || !initialCompany.team_id) return false;

      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", initialCompany.team_id)
        .eq("user_id", user.id)
        .maybeSingle();

      return !!teamMember;
    },
    enabled: !!user?.id && !!initialCompany.team_id,
  });

  const calculateAverageRating = (reviews: { rating: number }[] = [], teamReviews: { rating: number }[] = []) => {
    const allReviews = [...reviews, ...(isTeamMember ? teamReviews : [])];
    if (!allReviews.length) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / allReviews.length).toFixed(1));
  };

  const updateCompanyMutation = useMutation({
    mutationFn: (updates: Partial<Company>) => updateCompany(initialCompany.id, updates),
    onSuccess: (updatedCompany) => {
      setEditedCompany(updatedCompany);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["userCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update company",
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

    const updatedComments = [...(editedCompany.comments || []), newCommentObj];

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
      averageRating: calculateAverageRating(updatedReviews, editedCompany.team_reviews || []),
    });
  };

  const averageRating = calculateAverageRating(editedCompany.reviews, editedCompany.team_reviews);

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
          onSave={handleSave}
        />

        <CardContent className="border-t pt-6">
          <CardTitle className="mb-4">Reviews</CardTitle>
          <div className="space-y-6">
            <ReviewForm companyId={initialCompany.id} onSubmit={handleAddReview} />
            <ReviewList 
              reviews={editedCompany.reviews || []} 
              teamReviews={editedCompany.team_reviews || []}
              showTeamReviews={isTeamMember}
              teamId={initialCompany.team_id}
            />
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