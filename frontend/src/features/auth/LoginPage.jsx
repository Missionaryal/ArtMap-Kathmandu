import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Button } from "@/components/ui/Button";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/"); // Redirect to homepage
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-card p-8 rounded-2xl shadow-soft w-full max-w-md space-y-6"
      >
        <h2 className="font-display text-2xl font-semibold text-center">
          Sign In
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
        />
        <Button type="submit" variant="gold" size="lg" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}
