import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button";
import logo from "../../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }

    setIsLoading(false);
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
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
                <a
                  href="#"
                  className="text-sm text-gold-400 hover:text-gold-500 font-medium"
                >
                  Forgot password?
                </a>
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
