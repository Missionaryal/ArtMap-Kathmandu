import React, { useState } from "react";
import { Button } from "../ui/Button";

export function RegisterForm({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ name, email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-card p-8 rounded-2xl shadow-soft space-y-6"
    >
      <h2 className="font-display text-2xl font-semibold text-center">
        Register
      </h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
      />
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
        Register
      </Button>
    </form>
  );
}
