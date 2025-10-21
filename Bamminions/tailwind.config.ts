import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  plugins: [
    forms,
  ],
} satisfies Config;
