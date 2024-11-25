import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Company } from "@/services/types";
import { Star, Link, Phone, Mail } from "lucide-react";

interface CompanyDetailsSectionProps {
  company: Company;
  editedCompany: Company;
  isEditing: boolean;
  setEditedCompany: (company: Company) => void;
  setIsEditing: (isEditing: boolean) => void;
  averageRating: number;
  onSave: () => void;
}

export const CompanyDetailsSection = ({
  company,
  editedCompany,
  isEditing,
  setEditedCompany,
  setIsEditing,
  averageRating,
  onSave,
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
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={onSave}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold">Industry:</span>
            {isEditing ? (
              <Input
                value={editedCompany.industry || ""}
                onChange={(e) =>
                  setEditedCompany({ ...editedCompany, industry: e.target.value })
                }
                className="max-w-[250px]"
              />
            ) : (
              <span>{editedCompany.industry || "Not specified"}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <Link className="h-4 w-4" /> Website:
            </span>
            {isEditing ? (
              <Input
                value={editedCompany.website || ""}
                onChange={(e) =>
                  setEditedCompany({ ...editedCompany, website: e.target.value })
                }
                className="max-w-[250px]"
              />
            ) : (
              <span>{editedCompany.website || "Not specified"}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <Phone className="h-4 w-4" /> Phone Number:
            </span>
            {isEditing ? (
              <Input
                value={editedCompany.phoneNumber || ""}
                onChange={(e) =>
                  setEditedCompany({ ...editedCompany, phoneNumber: e.target.value })
                }
                className="max-w-[250px]"
              />
            ) : (
              <span>{editedCompany.phoneNumber || "Not specified"}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email:
            </span>
            {isEditing ? (
              <Input
                value={editedCompany.email || ""}
                onChange={(e) =>
                  setEditedCompany({ ...editedCompany, email: e.target.value })
                }
                className="max-w-[250px]"
              />
            ) : (
              <span>{editedCompany.email || "Not specified"}</span>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );
};