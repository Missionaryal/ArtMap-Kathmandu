import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, Clock, CheckCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import logo from "../../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  // Success message from registration redirect
  const registrationSuccess = !hasStartedTyping && location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setHasStartedTyping(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setIsSuccess(false);
    setHasStartedTyping(true); // Clear registration success message

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setIsSuccess(true);
      setError("");
      
      // Delay navigation to show success state
      setTimeout(() => {
        if (result.user?.is_creator && result.user?.creator_status === "approved") {
          navigate("/creator");
        } else {
          navigate("/");
        }
      }, 1500);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start mb-12">
            <img src={logo} alt="ArtMap Logo" className="h-16 w-auto" />
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-serif font-bold text-stone-900 mb-3">
              Welcome back
            </h1>
            <p className="text-lg text-stone-600">
              Sign in to continue exploring Kathmandu's art scene
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl text-base flex items-start gap-4 animate-in fade-in zoom-in duration-300 shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold font-serif text-lg mb-1 leading-tight text-green-900">
                    Login Successful
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Welcome back! You are being redirected to your dashboard...
                  </p>
                </div>
              </div>
            )}

            {registrationSuccess && !isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{registrationSuccess}</span>
              </div>
            )}

            {error && !isSuccess && (
              <div
                className={`border px-5 py-4 rounded-xl text-base flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  error.includes("under review")
                    ? "bg-amber-50 border-amber-200 text-amber-800 ring-2 ring-amber-100 ring-offset-0 animate-pulse-subtle"
                    : error.includes("not approved")
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-red-50 border-red-200 text-red-700 font-medium"
                }`}
              >
                {error.includes("under review") ? (
                  <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {(error.includes("under review") ||
                    error.includes("not approved")) && (
                    <h4 className="font-bold font-serif text-lg mb-1 leading-tight">
                      {error.includes("under review")
                        ? "Application Under Review"
                        : "Application Status"}
                    </h4>
                  )}
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-stone-800">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gold-400 hover:text-gold-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full !text-base"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="pt-6 border-t border-stone-200">
              <p className="text-center text-stone-600 mb-4 text-base">
                New to ArtMap?
              </p>
              <Link
                to="/register"
                className="block w-full py-3 text-center border-2 border-stone-300 text-stone-800 font-semibold rounded-lg hover:border-stone-400 hover:bg-stone-50 transition-all text-base"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Creative Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-cream-200 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-8">
            <img
              src={logo}
              alt="ArtMap Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-5 leading-tight">
            Discover Cultural Treasures
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed">
            Connect with galleries, museums, and creative spaces. Save your
            favorites and plan your cultural journey.
          </p>
        </div>
      </div>
    </div>
  );
}
