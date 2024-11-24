import { Building2, Mail, Phone, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Company } from "@/services/types";

interface CompanyDetailsSectionProps {
  company: Company;
  editedCompany: Company;
  isEditing: boolean;
  setEditedCompany: (company: Company) => void;
  setIsEditing: (editing: boolean) => void;
}

export const CompanyDetailsSection = ({
  company,
  editedCompany,
  isEditing,
  setEditedCompany,
  setIsEditing,
}: CompanyDetailsSectionProps) => {
  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const handleInputChange = (field: keyof Company, value: string) => {
    setEditedCompany({
      ...editedCompany,
      [field]: value,
    });
  };

  return (
    <div>
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
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Website URL"
              />
            ) : (
              <a 
                href={formatWebsiteUrl(company.website || '')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-primary"
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
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email address"
              />
            ) : (
              <span>{company.email || 'No email provided'}</span>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
};