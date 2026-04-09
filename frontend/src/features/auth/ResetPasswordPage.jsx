import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";
import api from "../../api/axiosConfig";
import logo from "../../assets/artmap final logo.jpeg";

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

export default function ResetPasswordPage() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/reset-password/${uidb64}/${token}/`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <img
              src={logo}
              alt="ArtMap"
              className="h-12 w-12 object-contain mix-blend-multiply"
            />
            <span className="font-serif font-bold text-xl text-stone-900">
              ArtMap
            </span>
          </Link>

          {!success ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-gold-100 rounded-2xl flex items-center justify-center mb-5">
                  <Lock className="w-7 h-7 text-gold-600" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
                  Reset your password
                </h1>
                <p className="text-stone-500 text-sm">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i <= strength.score
                                ? strength.color
                                : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-stone-400">
                        Strength:{" "}
                        <span className="font-medium">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 pr-11 ${
                        confirm && confirm !== password
                          ? "border-red-300 bg-red-50"
                          : "border-stone-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Passwords do not match
                    </p>
                  )}
                  {confirm && confirm === password && password.length >= 6 && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">
                Password reset!
              </h2>
              <p className="text-stone-500 text-sm mb-6">
                Your password has been successfully updated. Redirecting to
                login...
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#F5F0E8] items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <img
            src={logo}
            alt="ArtMap"
            className="w-20 h-20 mx-auto mb-6 object-contain mix-blend-multiply"
          />
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">
            Secure Reset
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            Choose a strong password with a mix of letters, numbers and symbols.
          </p>
        </div>
      </div>
    </div>
  );
}
