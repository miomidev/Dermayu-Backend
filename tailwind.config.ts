import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dermayu: {
          primary: "#38746D",
          hover: "#24544E",
          dark: "#1D443F",
          light: "#EEF5F3",
          border: "#D5E4E0",
        },
      },
    },
  },
  plugins: [],
};

export default config;

