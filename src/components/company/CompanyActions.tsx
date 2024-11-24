import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star, PlusSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addToUserRepository, removeFromUserRepository, addReview } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { Company } from "@/services/types";
import { supabase } from "@/integrations/supabase/client";

interface CompanyActionsProps {
  company: Company;
  isPrivate?: boolean;
}

export const CompanyActions = ({ company, isPrivate = false }: CompanyActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ["user-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("created_by", user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToRepositoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !company) {
        throw new Error("Missing required information");
      }
      await addToUserRepository(company.id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: `${company.name} added to your repository`,
      });
    },
    onError: (error) => {
      console.error("Error adding to repository:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add company to repository",
      });
    },
  });

  const addToProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user?.id || !company.id) {
        throw new Error("Missing required information");
      }
      const { error } = await supabase
        .from("project_companies")
        .insert([{ project_id: projectId, company_id: company.id }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      queryClient.invalidateQueries({ queryKey: ["available-companies"] });
      toast({
        title: "Success",
        description: "Company added to project successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add company to project",
      });
    },
  });

  const removeFromRepositoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !company.id) {
        throw new Error("Missing required information");
      }
      await removeFromUserRepository(company.id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: `${company.name} removed from your repository`,
      });
    },
    onError: (error) => {
      console.error("Error removing from repository:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove company from repository",
      });
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: (review: { rating: number; comment: string }) => 
      addReview(company.id, review),
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

  const handleAddToRepository = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to add companies to your repository",
      });
      return;
    }
    addToRepositoryMutation.mutate();
  };

  const handleRemoveFromRepository = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to remove companies from your repository",
      });
      return;
    }
    removeFromRepositoryMutation.mutate();
  };

  const calculateAverageRating = () => {
    if (!company.reviews || company.reviews.length === 0) return 0;
    const sum = company.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / company.reviews.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="flex space-x-2">
      {!isPrivate ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToRepository}
          disabled={addToRepositoryMutation.isPending}
        >
          <PlusSquare className="h-4 w-4 mr-1" />
          {addToRepositoryMutation.isPending ? "Adding..." : "Add"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveFromRepository}
          disabled={removeFromRepositoryMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {removeFromRepositoryMutation.isPending ? "Removing..." : "Remove"}
        </Button>
      )}

      {/* Add to Project Dialog */}
      {projects && projects.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusSquare className="h-4 w-4 mr-1" />
              Add to Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addToProjectMutation.mutate(project.id)}
                >
                  {project.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

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
            {company.reviews && company.reviews.length > 0 ? (
              <ReviewList reviews={company.reviews} />
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
            {user && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
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
          ({company.reviews?.length || 0})
        </span>
      </div>
    </div>
  );
};
