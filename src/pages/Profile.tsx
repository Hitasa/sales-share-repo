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
import { UserCompanies } from "@/components/UserCompanies";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Profile = () => {
  const userProfile = {
    name: "John Doe",
    company: "Sales Excellence Inc.",
    role: "Senior Sales Representative",
    email: "john.doe@salesexcellence.com",
    phone: "+1 (555) 123-4567",
    bio: "Experienced sales professional with over 10 years in B2B software sales. Specialized in building and maintaining long-term client relationships.",
  };

  const [userComments, setUserComments] = useState("");

  const handleSaveComments = () => {
    // In a real application, this would save to a backend
    toast.success("Comments saved successfully");
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
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
                    <div>
                      <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                      <CardDescription>{userProfile.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span>{userProfile.company}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span>{userProfile.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <span>{userProfile.phone}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-600 mb-4">{userProfile.bio}</p>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Additional Comments</h4>
                      <Textarea
                        placeholder="Add your comments here..."
                        value={userComments}
                        onChange={(e) => setUserComments(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button onClick={handleSaveComments}>Save Comments</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-card mt-6">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <p className="font-medium">Created new repository</p>
                        <p className="text-gray-500">2 hours ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Shared repository with team</p>
                        <p className="text-gray-500">1 day ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Updated sales strategy</p>
                        <p className="text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="companies">
            <UserCompanies />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;