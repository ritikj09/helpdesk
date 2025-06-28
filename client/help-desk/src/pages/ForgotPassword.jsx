import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword, resetPassword } from "../axios/helper";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = () => {
    if (!formData.email) return "Email is required.";
    if (!formData.email.endsWith("@iiita.ac.in")) return "Email must end with @iiita.ac.in.";
    return null;
  };

  const validateResetInputs = () => {
    const { otp, newPassword } = formData;

    if (!otp || !newPassword) return "OTP and new password are required.";

    if (
      newPassword.length < 6 ||
      newPassword.length > 14 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return "Password must be 6–14 characters with at least one uppercase letter and one number.";
    }

    return null;
  };

  const handleSendOTP = async () => {
    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      await forgotPassword({ email: formData.email });
      setOtpSent(true);
      setMessage("OTP sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const validationError = validateResetInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      await resetPassword(formData); // calls OTP + password verification
      setMessage("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {message && <p className="text-green-600 text-center">{message}</p>}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={otpSent}
              />
            </div>

            {!otpSent && (
              <Button
                type="button"
                onClick={handleSendOTP}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}

            {otpSent && (
              <>
                <div>
                  <Label>OTP</Label>
                  <Input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
