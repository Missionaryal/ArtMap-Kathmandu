import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import logo from "../../assets/artmap final logo.jpeg";
import { BACKEND_URL } from "../../api/axiosConfig";

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "artmap-admin-2026";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [touched, setTouched] = useState({});

  const registrationSuccess = !hasStartedTyping && location.state?.message;

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "Enter a valid email";
    if (!formData.password) errs.password = "Password is required";
    return errs;
  };
  const fieldErrors = validate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setHasStartedTyping(true);
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        // Admin/superuser — redirect to secret admin URL from env
        if (result.user?.is_staff || result.user?.is_superuser) {
          window.location.href = `${BACKEND_URL}/${ADMIN_URL}/`;
          return;
        }
        // Approved creator — creator dashboard
        if (
          result.user?.is_creator &&
          result.user?.creator_status === "approved"
        ) {
          navigate("/creator");
          return;
        }
        // Regular user — home
        navigate("/");
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Success */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl text-base flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold font-serif text-lg mb-1">
                    Login Successful
                  </h4>
                  <p className="text-sm">Welcome back! Redirecting...</p>
                </div>
              </div>
            )}

            {/* Registration success message */}
            {registrationSuccess && !isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{registrationSuccess}</span>
              </div>
            )}

            {/* Error */}
            {error && !isSuccess && (
              <div
                className={`border px-5 py-4 rounded-xl text-base flex items-start gap-4 ${
                  error.includes("under review")
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {error.includes("under review") ? (
                  <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {error.includes("under review") && (
                    <h4 className="font-bold font-serif text-lg mb-1">
                      Application Under Review
                    </h4>
                  )}
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                required
                className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent ${
                  touched.email && fieldErrors.email
                    ? "border-red-300 bg-red-50"
                    : "border-stone-300"
                }`}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
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
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  required
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent pr-12 ${
                    touched.password && fieldErrors.password
                      ? "border-red-300 bg-red-50"
                      : "border-stone-300"
                  }`}
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
              {touched.password && fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || isSuccess}
              className="w-full !text-base"
            >
              {isLoading
                ? "Signing in..."
                : isSuccess
                  ? "Redirecting..."
                  : "Sign In"}
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

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F5F0E8] items-center justify-center p-12">
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
