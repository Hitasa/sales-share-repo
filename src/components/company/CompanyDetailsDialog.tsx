import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Mail, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import ReviewList from "@/components/ReviewList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Company } from "@/services/types";
import { useToast } from "@/hooks/use-toast";
import { updateCompany } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

interface CompanyDetailsDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompanyDetailsDialog = ({ company, open, onOpenChange }: CompanyDetailsDialogProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(company);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      await updateCompany(company.id, editedCompany);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update company information",
      });
    }
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
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
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
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                )}

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