import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 14px 36px rgba(15, 23, 42, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
