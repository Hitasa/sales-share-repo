import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import ReviewList from "@/components/ReviewList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Company, Comment } from "@/services/types";
import { useToast } from "@/hooks/use-toast";
import { updateCompany } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyDetailsSection } from "./CompanyDetailsSection";
import { CompanyCommentsSection } from "./CompanyCommentsSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CompanyDetailsDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CompanyReviewsResponse {
  reviews: any[];
  team_id: string | null;
}

export const CompanyDetailsDialog = ({ company, open, onOpenChange }: CompanyDetailsDialogProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(company);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  // Fetch company reviews
  const { data: companyWithReviews } = useQuery({
    queryKey: ["companyReviews", company.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('reviews, team_id')
          .eq('id', company.id)
          .maybeSingle();
        
        if (error) throw error;
        
        // If no data found or if the company belongs to a team (private), don't show its reviews in public view
        if (!data || data.team_id) {
          return { reviews: [], team_id: data?.team_id } as CompanyReviewsResponse;
        }
        
        return { reviews: data.reviews || [], team_id: data.team_id } as CompanyReviewsResponse;
      } catch (error) {
        console.error('Error fetching company reviews:', error);
        return { reviews: [], team_id: null } as CompanyReviewsResponse;
      }
    },
    initialData: { reviews: company.reviews || [], team_id: company.team_id } as CompanyReviewsResponse
  });

  const handleSave = async () => {
    try {
      await updateCompany(company.id, editedCompany);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update company",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: crypto.randomUUID(),
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(editedCompany.comments || []), newCommentObj];

    try {
      await updateCompany(company.id, { 
        ...editedCompany, 
        comments: updatedComments 
      });
      
      setEditedCompany(prev => ({
        ...prev,
        comments: updatedComments
      }));
      
      setNewComment("");
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
      });
    }
  };

  const calculateAverageRating = (reviews: { rating: number }[] = []) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const averageRating = calculateAverageRating(companyWithReviews?.reviews);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{company.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card">
              <CompanyDetailsSection
                company={company}
                editedCompany={editedCompany}
                isEditing={isEditing}
                setEditedCompany={setEditedCompany}
                setIsEditing={setIsEditing}
                averageRating={averageRating}
                onSave={handleSave}
              />
              <CardContent>
                <CompanyCommentsSection
                  editedCompany={editedCompany}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  onAddComment={handleAddComment}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Latest Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {companyWithReviews?.reviews && companyWithReviews.reviews.length > 0 ? (
                    <ReviewList reviews={companyWithReviews.reviews} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};