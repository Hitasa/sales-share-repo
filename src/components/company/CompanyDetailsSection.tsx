import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Company } from "@/services/types";
import { Star } from "lucide-react";

interface CompanyDetailsSectionProps {
  company: Company;
  editedCompany: Company;
  isEditing: boolean;
  setEditedCompany: (company: Company) => void;
  setIsEditing: (isEditing: boolean) => void;
  averageRating: number;
}

export const CompanyDetailsSection = ({
  company,
  editedCompany,
  isEditing,
  setEditedCompany,
  setIsEditing,
  averageRating,
}: CompanyDetailsSectionProps) => {
  return (
    <>
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">
              {isEditing ? (
                <Input
                  value={editedCompany.name}
                  onChange={(e) =>
                    setEditedCompany({ ...editedCompany, name: e.target.value })
                  }
                  className="text-2xl font-bold"
                />
              ) : (
                company.name
              )}
            </CardTitle>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= averageRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                ({averageRating} / 5)
              </span>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span className="font-bold">Industry:</span>
            <span>{editedCompany.industry}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Sales Volume:</span>
            <span>{editedCompany.salesVolume}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Growth:</span>
            <span>{editedCompany.growth}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Website:</span>
            <span>{editedCompany.website}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Phone Number:</span>
            <span>{editedCompany.phoneNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Email:</span>
            <span>{editedCompany.email}</span>
          </div>
        </div>
      </CardContent>
    </>
  );
};
