import nextPlugin from "@next/eslint-plugin-next";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  { ignores: [".next/**", "node_modules/**", "coverage/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: typescriptParser },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": typescriptPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules
    }
  }
];
