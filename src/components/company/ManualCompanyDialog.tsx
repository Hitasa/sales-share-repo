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

export function ManualCompanyDialog() {
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
        <AddCompanyForm />
      </DialogContent>
    </Dialog>
  );
}