import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { User, Building2, Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button";
import logo from "../../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "explorer",
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

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
    );

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Creative Content */}
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
            Join Our Creative Community
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed">
            Whether you're an art lover or a creator, ArtMap connects you to
            Kathmandu's vibrant cultural scene.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo - Mobile Only */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="ArtMap Logo" className="h-16 w-auto" />
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-3">
              Create your account
            </h1>
            <p className="text-lg text-stone-600">
              Start your journey through Kathmandu's art scene
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleRoleSelect("explorer")}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                formData.role === "explorer"
                  ? "border-gold-400 bg-gold-50"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <User
                className={`w-7 h-7 mb-3 ${formData.role === "explorer" ? "text-gold-400" : "text-stone-400"}`}
              />
              <div className="font-semibold text-stone-900 mb-1 text-base">
                Explorer
              </div>
              <div className="text-sm text-stone-600">Discover art spaces</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("creator")}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                formData.role === "creator"
                  ? "border-gold-400 bg-gold-50"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <Building2
                className={`w-7 h-7 mb-3 ${formData.role === "creator" ? "text-gold-400" : "text-stone-400"}`}
              />
              <div className="font-semibold text-stone-900 mb-1 text-base">
                Creator
              </div>
              <div className="text-sm text-stone-600">List your space</div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              />
            </div>

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
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-base pt-2">
              <span className="text-stone-600">Already have an account? </span>
              <Link
                to="/login"
                className="text-gold-400 hover:text-gold-500 font-semibold"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
