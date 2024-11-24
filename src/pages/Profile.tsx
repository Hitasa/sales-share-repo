import { ProfileForm } from "@/components/profile/ProfileForm";
import { TeamList } from "@/components/team/TeamList";

const Profile = () => {
  return (
    <div className="container mx-auto py-20 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <ProfileForm />
        </div>
        <div>
          <TeamList />
        </div>
      </div>
    </div>
  );
};

export default Profile;