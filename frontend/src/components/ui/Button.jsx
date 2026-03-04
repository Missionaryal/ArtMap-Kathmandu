export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) {
  const baseStyles =
    "font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-gold-400 text-white hover:bg-gold-500 focus:ring-gold-400 shadow-md hover:shadow-lg",
    secondary:
      "bg-white text-gold-400 border-2 border-gold-400 hover:bg-gold-50 focus:ring-gold-400",
    outline:
      "bg-transparent text-stone-700 border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 focus:ring-stone-400",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
