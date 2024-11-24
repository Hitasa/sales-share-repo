import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddCompanyForm } from "@/components/AddCompanyForm";

interface AddCompanyDialogProps {
  onAddCompany: (formData: any) => void;
}

export const AddCompanyDialog = ({ onAddCompany }: AddCompanyDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusSquare className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <AddCompanyForm onSubmit={onAddCompany} />
      </DialogContent>
    </Dialog>
  );
};