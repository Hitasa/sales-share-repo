import { UserRound, Building2, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProfileData } from "./types";

interface ProfileFormProps {
  profile: ProfileData;
  isEditing: boolean;
  setProfile: (profile: ProfileData) => void;
  onSave: () => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const ProfileForm = ({
  profile,
  isEditing,
  setProfile,
  onSave,
  setIsEditing,
}: ProfileFormProps) => {
  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <UserRound className="h-10 w-10 text-primary" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={profile.first_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                placeholder="First Name"
              />
              <Input
                value={profile.last_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                placeholder="Last Name"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-muted-foreground">{profile.role}</p>
            </>
          )}
        </div>
        <Button
          onClick={() => {
            if (isEditing) {
              onSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-5 w-5 text-primary" />
          {isEditing ? (
            <Input
              value={profile.company || ""}
              onChange={(e) =>
                setProfile({ ...profile, company: e.target.value })
              }
              placeholder="Company"
              className="flex-1"
            />
          ) : (
            <span>{profile.company || "Not specified"}</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-primary" />
          {isEditing ? (
            <Input
              value={profile.email || ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              placeholder="Email"
              className="flex-1"
            />
          ) : (
            <span>{profile.email || "Not specified"}</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5 text-primary" />
          {isEditing ? (
            <Input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="Phone"
              className="flex-1"
            />
          ) : (
            <span>{profile.phone || "Not specified"}</span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t mt-6">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        {isEditing ? (
          <Textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="min-h-[100px]"
          />
        ) : (
          <p className="text-gray-600 mb-4">{profile.bio || "No bio provided"}</p>
        )}
      </div>
    </>
  );
};