import { useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TeamList } from "@/components/team/TeamList";
import { ProfileData } from "@/components/profile/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as ProfileData;
    },
    enabled: !!user?.id,
  });

  const handleSave = async () => {
    if (!user?.id || !profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    }
  };

  return (
    <div className="container mx-auto py-20 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {profile && (
            <ProfileForm
              profile={profile}
              isEditing={isEditing}
              setProfile={(newProfile) => {
                // Update local state
                refetch();
              }}
              onSave={handleSave}
              setIsEditing={setIsEditing}
            />
          )}
        </div>
        <div>
          <TeamList />
        </div>
      </div>
    </div>
  );
};

export default Profile;