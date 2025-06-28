import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  registerAdmin,
  registerPersonnel,
} from "../axios/helper.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    rollNumber: "",
    category: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, role, rollNumber, category } = formData;

    if (!name || !email || !phone || !password) {
      return "All fields are required.";
    }

    if (role === "user" && !rollNumber) {
      return "Roll number is required for users.";
    }

    if (role === "worker" && !category) {
      return "Category is required for workers.";
    }

    if (!email.endsWith("@iiita.ac.in")) {
      return "Email must end with @iiita.ac.in";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,14}$/;
    if (!passwordRegex.test(password)) {
      return "Password must be 6-14 characters, include at least 1 uppercase letter and 1 number.";
    }

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      if (formData.role === "user") {
        await registerUser(formData);
      } else if (formData.role === "admin") {
        await registerAdmin(formData);
      } else {
        await registerPersonnel(formData);
      }

      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {formData.role === "user" && (
              <div>
                <Label>Roll Number</Label>
                <Input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.role === "worker" && (
              <div>
                <Label>Category</Label>
                <Input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value,
                    // Reset specific fields on role change
                    rollNumber: "",
                    category: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue>{formData.role}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600">
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
