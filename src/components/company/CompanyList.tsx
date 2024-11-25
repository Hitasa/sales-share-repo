import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyActions } from "./CompanyActions";
import { CompanyDetailsDialog } from "./CompanyDetailsDialog";
import { CompanyProfile } from "./CompanyProfile";
import { Company } from "@/services/types";
import { ExternalLink, Star, Link } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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

  // Move the team membership query to the component level
  const { data: teamMemberships = {} } = useQuery({
    queryKey: ["teamMemberships", companies.map(c => c.team_id), user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const teamIds = companies
        .map(c => c.team_id)
        .filter((id): id is string => id !== null);

      if (teamIds.length === 0) return {};

      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .in("team_id", teamIds);

      return teamMembers?.reduce((acc: Record<string, boolean>, member) => {
        if (member.team_id) {
          acc[member.team_id] = true;
        }
        return acc;
      }, {}) || {};
    },
    enabled: !!user?.id && companies.some(c => c.team_id !== null),
  });

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

  const getTeatmikUrl = (registryCode: string | null | undefined) => {
    if (!registryCode) return null;
    return `https://teatmik.ee/en/person/${registryCode}`;
  };

  const getVisibleReviewsCount = (company: Company) => {
    const isTeamMember = company.team_id ? teamMemberships[company.team_id] : false;
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
                  <div className="flex items-center gap-2">
                    {company.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 py-0 text-xs"
                        onClick={(e) => handleWebsiteClick(company.website!, e)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </Button>
                    )}
                    {company.registry_code && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 py-0 text-xs"
                        onClick={(e) => handleWebsiteClick(getTeatmikUrl(company.registry_code)!, e)}
                      >
                        <Link className="h-3 w-3 mr-1" />
                        Teatmik
                      </Button>
                    )}
                  </div>
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