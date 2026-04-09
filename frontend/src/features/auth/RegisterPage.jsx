// RegisterPage.jsx
// The registration page where new users and creators sign up.
// The form changes depending on whether the user selects Explorer or Creator role.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  User,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";
import logo from "../../assets/artmap final logo.jpeg";

// Calculate password strength based on length, uppercase, numbers, and special characters
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  return { score, label: "Strong", color: "bg-green-400" };
}

// Auto-generate a username for creators from their email address.
// We do this so creators don't need to think of a username.
// Example: info@thethangka.com -> info_thethangka
function buildUsername(email) {
  const parts = email.split("@");
  const prefix = parts[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
  const domain = (parts[1] || "")
    .split(".")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();
  return domain ? `${prefix}_${domain}` : prefix;
}

// Convert raw Django/API error messages into friendlier user-facing text
function humanizeError(error) {
  if (!error) return "Something went wrong. Please try again.";
  const lower = error.toLowerCase();
  if (
    lower.includes("username already exists") ||
    lower.includes("username is already")
  ) {
    return "An account linked to this email already exists. Please use a different email address.";
  }
  if (
    lower.includes("email already exists") ||
    lower.includes("email is already") ||
    lower.includes("user with this email")
  ) {
    return "This email is already registered. Try signing in instead.";
  }
  if (lower.includes("password") && lower.includes("common")) {
    return "This password is too common. Please choose a stronger, more unique password.";
  }
  if (
    lower.includes("password") &&
    (lower.includes("short") || lower.includes("at least"))
  ) {
    return "Password is too short. Please use at least 8 characters.";
  }
  if (lower.includes("pending") || lower.includes("under review")) {
    return "Your creator application is currently under review. Please wait for approval.";
  }
  if (lower.includes("not approved") || lower.includes("rejected")) {
    return "Your creator application was not approved. Contact support@artmap.com for help.";
  }
  return error;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "explorer",
    business_name: "",
    category: "gallery",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const categories = [
    { value: "gallery", label: "Art Gallery" },
    { value: "museum", label: "Museum" },
    { value: "studio", label: "Artist Studio" },
    { value: "workshop", label: "Workshop" },
    { value: "cafe", label: "Art Cafe" },
    { value: "thangka", label: "Thangka Art" },
    { value: "pottery", label: "Pottery" },
    { value: "weaving", label: "Weaving" },
    { value: "sculpture", label: "Sculpture" },
    { value: "photography", label: "Photography" },
  ];

  const passwordStrength = getPasswordStrength(formData.password);
  const isCreator = formData.role === "creator";

  // Validate the form fields based on the current role
  const validate = () => {
    const errs = {};
    // Username is only required for explorers — creators get an auto-generated one
    if (!isCreator) {
      if (!formData.username.trim()) errs.username = "Username is required";
      else if (formData.username.length < 3)
        errs.username = "At least 3 characters";
      else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
        errs.username = "Letters, numbers and underscores only";
    }
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "Enter a valid email address";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6)
      errs.password = "At least 6 characters required";
    // Business name is only required for creators
    if (isCreator) {
      if (!formData.business_name.trim())
        errs.business_name = "Business / space name is required";
      else if (formData.business_name.trim().length < 3)
        errs.business_name = "Name must be at least 3 characters";
    }
    return errs;
  };

  const fieldErrors = validate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Switch between Explorer and Creator role — resets validation state
  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setTouched({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      business_name: true,
    });
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    setError("");

    // Creators get an auto-generated username derived from their email
    // Explorers enter their own username manually
    const usernameToUse = isCreator
      ? buildUsername(formData.email)
      : formData.username;

    const result = await register(
      usernameToUse,
      formData.email,
      formData.password,
      formData.role,
      isCreator
        ? { business_name: formData.business_name, category: formData.category }
        : {},
    );

    if (result.success) {
      // Redirect to login with a success message shown at the top of the form
      navigate("/login", { state: { message: result.message } });
    } else {
      setError(humanizeError(result.error));
    }
    setIsLoading(false);
  };

  // Returns the correct CSS class for an input field based on its validation state
  const inputClass = (field) =>
    `w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-white ${
      touched[field] && fieldErrors[field]
        ? "border-red-300 bg-red-50"
        : "border-stone-200"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left Side — decorative panel, hidden on mobile */}
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
            Join Our Creative Community
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed">
            Whether you're an art lover or a creator, ArtMap connects you to
            Kathmandu's vibrant cultural scene.
          </p>
        </div>
      </div>

      {/* Right Side — Registration Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-8 bg-[#FAF8F5] overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="ArtMap Logo" className="h-16 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">
              Create your account
            </h1>
            <p className="text-base text-stone-500">
              Start your journey through Kathmandu's art scene
            </p>
          </div>

          {/* Role selector — Explorer or Creator */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleRoleSelect("explorer")}
              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                formData.role === "explorer"
                  ? "border-gold-400 bg-[#FDF8EE]"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <User
                className={`w-6 h-6 mb-3 ${formData.role === "explorer" ? "text-stone-500" : "text-stone-400"}`}
              />
              <div className="font-semibold text-stone-900 mb-0.5 text-base">
                Explorer
              </div>
              <div className="text-sm text-stone-500">Discover art spaces</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("creator")}
              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                formData.role === "creator"
                  ? "border-gold-400 bg-[#FDF8EE]"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <Building2
                className={`w-6 h-6 mb-3 ${formData.role === "creator" ? "text-gold-500" : "text-stone-400"}`}
              />
              <div className="font-semibold text-stone-900 mb-0.5 text-base">
                Creator
              </div>
              <div className="text-sm text-stone-500">List your space</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Global error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold text-sm mb-0.5">
                    Registration Issue
                  </p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Username — Explorer only (creators get auto-generated username) */}
            {!isCreator && (
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Choose a username"
                  className={inputClass("username")}
                />
                {touched.username && fieldErrors.username && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.username}
                  </p>
                )}
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
                className={inputClass("email")}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone — Creator only */}
            {isCreator && (
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+977 98XXXXXXXX"
                  className={inputClass("phone")}
                />
              </div>
            )}

            {/* Business name — Creator only */}
            {isCreator && (
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  Business / Space Name
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your gallery or studio name"
                  className={inputClass("business_name")}
                />
                {touched.business_name && fieldErrors.business_name && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.business_name}
                  </p>
                )}
              </div>
            )}

            {/* Category dropdown — Creator only */}
            {isCreator && (
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white text-stone-700"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Password with strength indicator */}
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
                  onBlur={handleBlur}
                  placeholder="Create a password"
                  className={`${inputClass("password")} pr-12`}
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

              {/* Password strength bar — 4 segments that fill as the password gets stronger */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.score
                            ? passwordStrength.color
                            : "bg-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">
                    Strength:{" "}
                    <span
                      className={`font-medium ${
                        passwordStrength.label === "Strong"
                          ? "text-green-600"
                          : passwordStrength.label === "Good"
                            ? "text-yellow-600"
                            : passwordStrength.label === "Fair"
                              ? "text-amber-600"
                              : "text-red-500"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}

              {touched.password && fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Info box — tells creators their account needs admin approval before they can log in */}
            {isCreator && (
              <div className="flex items-start gap-3 bg-[#FDF8EE] border border-[#E8D9A0] rounded-2xl px-5 py-4">
                <ShieldCheck className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-800 text-sm mb-1">
                    Admin Verification Required
                  </p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Your account will be reviewed within 2–3 business days. Once
                    approved, you can add full details like address, gallery
                    photos, and events from your Creator Dashboard.
                  </p>
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
              {isLoading
                ? isCreator
                  ? "Submitting..."
                  : "Creating account..."
                : isCreator
                  ? "Submit Application"
                  : "Create Account"}
            </Button>

            <div className="text-center text-base pt-2">
              <span className="text-stone-500">Already have an account? </span>
              <Link
                to="/login"
                className="text-gold-500 hover:text-gold-600 font-semibold"
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
