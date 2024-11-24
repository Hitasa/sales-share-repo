import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddCompanyForm } from "../AddCompanyForm";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addCompany } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function ManualCompanyDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (formData: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => {
    if (!user) return;

    try {
      await addCompany({
        name: formData.name,
        industry: formData.industry,
        sales_volume: formData.salesVolume,
        growth: formData.growth,
        created_by: user.id,
      });
      
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add company",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add to Shared Repository
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
          <DialogDescription>
            Add a new company to the shared repository.
          </DialogDescription>
        </DialogHeader>
        <AddCompanyForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}