import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">{user.name}</CardTitle>
          <p className="text-gray-500">{user.role.toUpperCase()}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 border rounded bg-gray-50">
            <p className="font-semibold text-gray-700">Name:</p>
            <p>{user.name}</p>
          </div>

          <div className="p-3 border rounded bg-gray-50">
            <p className="font-semibold text-gray-700">Email:</p>
            <p>{user.email}</p>
          </div>

          <div className="p-3 border rounded bg-gray-50">
            <p className="font-semibold text-gray-700">Role:</p>
            <p>{user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
