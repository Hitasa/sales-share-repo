import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReviewList from "@/components/ReviewList";
import { Company } from "@/services/types";

interface CompanyDetailsDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompanyDetailsDialog = ({ company, open, onOpenChange }: CompanyDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4">
            {company.website && (
              <div>
                <h4 className="text-sm font-medium">Website</h4>
                <p className="text-sm text-muted-foreground">
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </p>
              </div>
            )}
            
            {company.phoneNumber && (
              <div>
                <h4 className="text-sm font-medium">Phone Number</h4>
                <p className="text-sm text-muted-foreground">{company.phoneNumber}</p>
              </div>
            )}

            {company.review && (
              <div>
                <h4 className="text-sm font-medium">Review</h4>
                <p className="text-sm text-muted-foreground">{company.review}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Latest Reviews</h3>
            <ScrollArea className="h-[200px]">
              {company.reviews && company.reviews.length > 0 ? (
                <ReviewList reviews={company.reviews} />
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};