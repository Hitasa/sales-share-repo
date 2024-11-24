import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star, PlusSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToUserRepository, removeFromUserRepository } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { Company } from "@/services/types";

interface CompanyActionsProps {
  company: Company;
  isPrivate?: boolean;
}

export const CompanyActions = ({ company, isPrivate = false }: CompanyActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addToRepositoryMutation = useMutation({
    mutationFn: () => addToUserRepository(company.id, user?.id || ""),
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add company to repository",
      });
    },
  });

  const removeFromRepositoryMutation = useMutation({
    mutationFn: () => removeFromUserRepository(company.id, user?.id || ""),
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove company from repository",
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
                <ReviewForm companyId={company.id} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const avgRating = company.reviews?.reduce((acc, review) => acc + review.rating, 0) || 0;
          const total = company.reviews?.length || 0;
          toast({
            description: total > 0 
              ? `Average rating: ${(avgRating / total).toFixed(1)} / 5.0 (${total} reviews)`
              : "No ratings yet",
          });
        }}
      >
        <Star className="h-4 w-4 mr-1" />
        Ratings
      </Button>
    </div>
  );
};