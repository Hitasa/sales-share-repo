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

export const CompanyDetailsDialog = ({ company, open, onOpenChange }: CompanyDetailsDialogProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(company);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: companyWithReviews } = useQuery({
    queryKey: ["companyReviews", company.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('reviews, team_id, comments, team_reviews')
          .eq('id', company.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          return { 
            reviews: [], 
            team_id: null, 
            comments: [],
            team_reviews: []
          };
        }
        
        // Combine regular reviews and team reviews
        const allReviews = [
          ...(data.reviews || []),
          ...(data.team_reviews || [])
        ];
        
        return { 
          reviews: allReviews,
          team_id: data.team_id,
          comments: data.comments || [],
          team_reviews: data.team_reviews || []
        };
      } catch (error) {
        console.error('Error fetching company reviews:', error);
        return { 
          reviews: [], 
          team_id: null, 
          comments: [],
          team_reviews: []
        };
      }
    },
    initialData: { 
      reviews: [...(company.reviews || []), ...(company.team_reviews || [])],
      team_id: company.team_id,
      comments: company.comments || [],
      team_reviews: company.team_reviews || []
    }
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
                    <ReviewList 
                      reviews={companyWithReviews.reviews} 
                      teamReviews={companyWithReviews.team_reviews || []}
                      showTeamReviews={!!companyWithReviews.team_id}
                      teamId={companyWithReviews.team_id}
                    />
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
