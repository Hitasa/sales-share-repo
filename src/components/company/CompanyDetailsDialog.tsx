import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Mail, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import ReviewList from "@/components/ReviewList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Company } from "@/services/types";

interface CompanyDetailsDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompanyDetailsDialog = ({ company, open, onOpenChange }: CompanyDetailsDialogProps) => {
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
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{company.name}</CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {company.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  
                  {company.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <span>{company.phoneNumber}</span>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span>{company.email}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{company.review}</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">Sales Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Sales Volume</p>
                      <p className="text-2xl font-bold">{company.salesVolume}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Growth</p>
                      <p className="text-2xl font-bold">{company.growth}</p>
                    </div>
                  </div>
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