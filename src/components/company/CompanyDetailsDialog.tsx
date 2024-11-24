import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Mail, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import ReviewList from "@/components/ReviewList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Company, Comment } from "@/services/types";
import { useToast } from "@/hooks/use-toast";
import { updateCompany } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now(),
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

  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    return `https://${cleanUrl}`;
  };

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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{company.name}</CardTitle>
                      <CardDescription>{company.industry}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={editedCompany.website || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, website: e.target.value })}
                        placeholder="Website URL"
                      />
                    ) : (
                      <a 
                        href={formatWebsiteUrl(company.website)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-primary"
                      >
                        {company.website || 'No website provided'}
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={editedCompany.phoneNumber || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, phoneNumber: e.target.value })}
                        placeholder="Phone number"
                      />
                    ) : (
                      <span>{company.phoneNumber || 'No phone number provided'}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={editedCompany.email || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                        placeholder="Email address"
                      />
                    ) : (
                      <span>{company.email || 'No email provided'}</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button onClick={handleSaveComments}>Save Changes</Button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-600 mb-4">{company.review}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Comments</h4>
                    <Textarea
                      placeholder="Add a new comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleAddComment}
                      className="w-full"
                    >
                      Add Comment
                    </Button>
                  </div>

                  <ScrollArea className="h-[200px] w-full">
                    <div className="space-y-4">
                      {editedCompany.comments?.map((comment) => (
                        <Card key={comment.id} className="p-4">
                          <p className="text-sm text-gray-600 mb-2">
                            {format(new Date(comment.createdAt), "PPp")}
                          </p>
                          <p className="text-gray-900">{comment.text}</p>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
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
                  {company.reviews && company.reviews.length > 0 ? (
                    <ReviewList reviews={company.reviews} />
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
