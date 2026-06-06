import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        surface: "#f8fafc",
        primary: "#2563eb",
        cyanAccent: "#06b6d4",
        violetAccent: "#7c3aed"
      },
      boxShadow: {
        workspace: "0 18px 48px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
