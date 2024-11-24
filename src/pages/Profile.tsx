import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSection } from "@/components/team/TeamSection";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { ProfileData } from "@/components/profile/types";

const defaultProfile: ProfileData = {
  first_name: "",
  last_name: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  bio: "",
};

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Profile doesn't exist, create one
        const { error: createError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, email: user.email }]);

        if (createError) {
          toast.error("Error creating profile");
          return;
        }

        setProfile({ ...defaultProfile, email: user.email || null });
        return;
      }

      toast.error("Error fetching profile");
      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast.error("Error updating profile");
      return;
    }

    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">My Team</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardContent className="space-y-6">
                    <ProfileForm
                      profile={profile}
                      isEditing={isEditing}
                      setProfile={setProfile}
                      onSave={handleSave}
                      setIsEditing={setIsEditing}
                    />
                  </CardContent>
                </CardHeader>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="team">
            <TeamSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;