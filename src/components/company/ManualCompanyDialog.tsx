import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addCompany } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const ManualCompanyDialog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    phoneNumber: "",
    review: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addCompany({
        ...formData,
        createdBy: user.id,
        sharedWith: [],
      });
      
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast.success("Company added successfully");
      setOpen(false);
      setFormData({
        name: "",
        website: "",
        phoneNumber: "",
        review: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to add company");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusSquare className="h-4 w-4 mr-2" />
          Add Company Manually
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Company Manually</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="+1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Review</Label>
            <Input
              id="review"
              value={formData.review}
              onChange={(e) =>
                setFormData({ ...formData, review: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Enter any additional information..."
            />
          </div>
          <Button type="submit" className="w-full">
            Add Company
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};