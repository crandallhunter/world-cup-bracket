import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Project-specific rule overrides.
  {
    rules: {
      // eslint-plugin-react-hooks 6 (ships with Next.js 16) promoted
      // `set-state-in-effect` to error. The hydration-guard pattern
      // `useEffect(() => setMounted(true), [])` trips it, along with
      // data-fetching effects that flip setLoading(true). These are
      // legitimate uses and refactoring them is a separate React-19
      // migration concern. Surfacing as warnings keeps them visible
      // without blocking CI.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
