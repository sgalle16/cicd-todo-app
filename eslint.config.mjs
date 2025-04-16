import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "*.config.js",
      "*.config.cjs",
      "*.d.ts",
    ],
  },

  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      eqeqeq: ["error", "always"], // Enforce strict equality
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off", // Allow console in dev
    },
  },

  ...tseslint.config({
    files: ["**/*.ts"], // Apply only to TypeScript files
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Override or add specific TS rules
      "no-unused-vars": "off", // Disable base JS rule for unused vars
      "@typescript-eslint/no-unused-vars": [
        // Enable TS version
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn", // Warn about using 'any'
      // Add any other TS-specific overrides here
    },
  }),

  pluginPrettierRecommended,
];
