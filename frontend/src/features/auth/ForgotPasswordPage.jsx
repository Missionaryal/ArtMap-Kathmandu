import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import logo from "../../assets/artmap final logo.jpeg";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
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

          {/* Back link */}
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-gold-100 rounded-2xl flex items-center justify-center mb-5">
                  <Mail className="w-7 h-7 text-gold-600" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
                  Forgot your password?
                </h1>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Enter your email address and we'll send you a link to reset
                  your password.
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
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">
                Check your email
              </h2>
              <p className="text-stone-500 text-sm mb-2 leading-relaxed">
                We sent a password reset link to
              </p>
              <p className="font-semibold text-stone-900 mb-6">{email}</p>
              <p className="text-xs text-stone-400 mb-8">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-gold-500 hover:text-gold-600 font-medium underline"
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 border-2 border-stone-300 text-stone-700 font-semibold rounded-xl hover:border-gold-400 hover:text-gold-600 transition-all text-sm"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F5F0E8] items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <img
            src={logo}
            alt="ArtMap"
            className="w-20 h-20 mx-auto mb-6 object-contain mix-blend-multiply"
          />
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">
            Secure Account Recovery
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            We'll send a secure link to your email. The link expires in 1 hour
            for your security.
          </p>
        </div>
      </div>
    </div>
  );
}
