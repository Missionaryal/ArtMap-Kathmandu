import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../../api/authApi";
import Button from "../../components/ui/Button";
import logo from "../../assets/logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);

      // Show reset link in development
      if (response.reset_link) {
        console.log("Password reset link:", response.reset_link);
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="ArtMap Logo" className="h-16 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-gold-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-3">
            Forgot password?
          </h1>
          <p className="text-stone-600 mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full !text-base"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
