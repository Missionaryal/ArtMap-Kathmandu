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
    username: "",
    email: "",
    password: "",
    role: "explorer",
    business_name: "",
    business_description: "",
    category: "gallery",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: "gallery", label: "Art Gallery" },
    { value: "museum", label: "Museum" },
    { value: "studio", label: "Artist Studio" },
    { value: "workshop", label: "Workshop" },
  ];

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

    // Basic validation for creators
    if (formData.role === "creator" && !formData.business_name) {
      setError("Business name is required for creators");
      setIsLoading(false);
      return;
    }

    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.role,
      formData.role === "creator" ? {
        business_name: formData.business_name,
        business_description: formData.business_description,
        category: formData.category
      } : {}
    );

    if (result.success) {
      navigate("/login", { 
        state: { message: result.message } 
      });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="ArtMap Logo" className="h-16 w-auto" />
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-3">
              Create your account
            </h1>
            <p className="text-lg text-stone-600">
              Start your journey through Kathmandu's art scene
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl text-base flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold font-serif text-lg mb-1 leading-tight text-red-900">
                    Registration Issue
                  </h4>
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
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

            {formData.role === "creator" && (
              <div className="space-y-5 pt-4 border-t border-stone-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Business Details
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Business / Art Space Name
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu Art Space"
                    required
                    className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Primary Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Short Description
                  </label>
                  <textarea
                    name="business_description"
                    value={formData.business_description}
                    onChange={handleChange}
                    placeholder="Describe your art space or studio..."
                    rows="3"
                    className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                  ></textarea>
                </div>
              </div>
            )}

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
