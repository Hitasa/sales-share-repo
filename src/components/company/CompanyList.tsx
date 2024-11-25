import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyActions } from "./CompanyActions";
import { CompanyDetailsDialog } from "./CompanyDetailsDialog";
import { CompanyProfile } from "./CompanyProfile";
import { Company } from "@/services/types";
import { ExternalLink, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyListProps {
  companies: Company[];
  isPrivate?: boolean;
  isTeamView?: boolean;
  onCompanySelect?: (company: Company) => void;
  additionalActions?: (company: Company) => React.ReactNode;
}

export const CompanyList = ({ 
  companies, 
  isPrivate = false,
  isTeamView = false,
  onCompanySelect,
  additionalActions 
}: CompanyListProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { user } = useAuth();

  const handleCompanyClick = (company: Company) => {
    if (isPrivate && onCompanySelect) {
      onCompanySelect(company);
    } else {
      setSelectedCompany(company);
    }
  };

  const handleWebsiteClick = (website: string, event: React.MouseEvent) => {
    event.stopPropagation();
    window.open(website, '_blank');
  };

  const getVisibleReviewsCount = (company: Company) => {
    // Check if user is part of the team
    const { data: isTeamMember = false } = useQuery({
      queryKey: ["teamMembership", company.team_id, user?.id],
      queryFn: async () => {
        if (!user?.id || !company.team_id) return false;

        const { data: teamMember } = await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", company.team_id)
          .eq("user_id", user.id)
          .maybeSingle();

        return !!teamMember;
      },
      enabled: !!user?.id && !!company.team_id,
    });

    const publicReviews = (company.reviews || []).filter(review => !review.isTeamReview);
    const teamReviews = company.team_reviews || [];
    return publicReviews.length + (isTeamMember ? teamReviews.length : 0);
  };

  if (selectedCompany && isPrivate) {
    return (
      <CompanyProfile 
        company={selectedCompany} 
        onBack={() => setSelectedCompany(null)} 
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell 
                  className="font-medium cursor-pointer hover:text-blue-600 flex items-center gap-2"
                  onClick={() => handleCompanyClick(company)}
                >
                  {company.name}
                  {company.website && (
                    <ExternalLink 
                      className="h-4 w-4 text-gray-400 hover:text-gray-600"
                      onClick={(e) => handleWebsiteClick(company.website!, e)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{getVisibleReviewsCount(company)}</span>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <CompanyActions company={company} isPrivate={isPrivate} isTeamView={isTeamView} />
                  {additionalActions && additionalActions(company)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCompany && !isPrivate && (
        <CompanyDetailsDialog
          company={selectedCompany}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
        />
      )}
    </>
  );
};