import { UserRound, Building2, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSection } from "@/components/team/TeamSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    company: "",
    role: "",
    email: "",
    phone: "",
    bio: "",
  });

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
                          <CardTitle className="text-2xl">
                            {profile.first_name} {profile.last_name}
                          </CardTitle>
                          <CardDescription>{profile.role}</CardDescription>
                        </>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        if (isEditing) {
                          handleSave();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
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
                        <span>{profile.company}</span>
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
                        <span>{profile.email}</span>
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
                        <span>{profile.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    {isEditing ? (
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-600 mb-4">{profile.bio}</p>
                    )}
                  </div>
                </CardContent>
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