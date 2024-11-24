import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserCompanies, Company, shareCompany, createOffer } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Share2, Send } from "lucide-react";

export const UserCompanies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shareEmail, setShareEmail] = useState("");
  const [offerAmount, setOfferAmount] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["userCompanies", user?.id],
    queryFn: () => fetchUserCompanies(user?.id || ""),
    enabled: !!user,
  });

  const handleShare = async (companyId: number) => {
    try {
      await shareCompany(companyId, shareEmail);
      toast({
        title: "Company shared successfully",
        description: `Company has been shared with ${shareEmail}`,
      });
      setShareEmail("");
    } catch (error) {
      toast({
        title: "Error sharing company",
        description: "Failed to share company. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateOffer = async (companyId: number) => {
    if (!user) return;
    
    try {
      await createOffer(companyId, {
        companyId,
        userId: user.id,
        type: "sent",
        amount: offerAmount,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
      });
      toast({
        title: "Offer sent successfully",
        description: `Offer of ${offerAmount} has been sent`,
      });
      setOfferAmount("");
    } catch (error) {
      toast({
        title: "Error sending offer",
        description: "Failed to send offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">My Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies?.map((company) => (
          <Card key={company.id} className="w-full">
            <CardHeader>
              <CardTitle>{company.name}</CardTitle>
              <CardDescription>{company.industry}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p>Sales Volume: {company.salesVolume}</p>
                  <p>Growth: {company.growth}</p>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Offers</h4>
                  {company.offers?.map((offer) => (
                    <div key={offer.id} className="text-sm">
                      <p>{offer.type === "sent" ? "Sent" : "Received"}: {offer.amount}</p>
                      <p className="text-muted-foreground">Status: {offer.status}</p>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Offer amount"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCreateOffer(company.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Share</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="User email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleShare(company.id)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};