import { useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TeamList } from "@/components/team/TeamList";
import { ProfileData } from "@/components/profile/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) throw error;
      
      // If no profile exists, create a default one
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{ id: user.id }])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as ProfileData;
      }

      return data as ProfileData;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: ProfileData) => {
      if (!user?.id) throw new Error("No user ID");
      const { error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", user.id);

      if (error) throw error;
      return updatedProfile;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
      });
    },
  });

  const handleSave = () => {
    if (editedProfile) {
      updateProfileMutation.mutate(editedProfile);
    }
  };

  return (
    <div className="container mx-auto py-20 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {profile && (
            <ProfileForm
              profile={editedProfile || profile}
              isEditing={isEditing}
              setProfile={setEditedProfile}
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