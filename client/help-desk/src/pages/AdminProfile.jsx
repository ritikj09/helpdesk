import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const AdminProfile = () => {
  const admin = useSelector((state) => state.auth.user);

  if (!admin || admin.role !== "admin") {
    return <p>Unauthorized Access</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg p-6">
        <CardHeader className="text-center">
          <img 
            src={admin.profilePic || "https://via.placeholder.com/150"} 
            alt="Profile" 
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <CardTitle className="text-xl font-semibold">{admin.name}</CardTitle>
          <p className="text-gray-500">{admin.role.toUpperCase()}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 border rounded bg-gray-50">
            <p className="font-semibold text-gray-700">Name:</p>
            <p>{admin.name}</p>
          </div>

          <div className="p-3 border rounded bg-gray-50">
            <p className="font-semibold text-gray-700">Email:</p>
            <p>{admin.email}</p>
          </div>

          <div className="p-3 border rounded bg-gray-50">
            <p className="font-semibold text-gray-700">Role:</p>
            <p>{admin.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
