import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, loginAdmin, loginPersonnel } from "../axios/helper";
import { loginSuccess } from "../redux/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (formData.role === "user") res = await loginUser(formData);
      else if (formData.role === "admin") res = await loginAdmin(formData);
      else if (formData.role === "worker") res = await loginPersonnel(formData);

      dispatch(loginSuccess({ user: res.user, role: formData.role }));

      if (formData.role === "user") navigate("/user/dashboard");
      else if (formData.role === "admin") navigate("/admin/dashboard");
      else if (formData.role === "worker") navigate("/personnel/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Select Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue>{formData.role}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center">
            Don't have an account? <a href="/register" className="text-blue-600">Register</a>
          </p>
          <p className="mt-2 text-sm text-center">
            <a href="/forgot-password" className="text-blue-600">Forgot Password?</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;