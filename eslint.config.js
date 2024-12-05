import perfectionist from "eslint-plugin-perfectionist";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ["**/.github/", "**/.husky/", "eslint.config.js"],
  },

  eslint.configs.recommended,
  tseslint.configs.recommended,

  // typescript rules
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
    },
  },

  // perfectionist
  {
    plugins: {
      perfectionist,
    },
    rules: getPerfectionistRules(),
  },
);

/**
 * @typedef CommonPerfectionistRules
 * @prop {bool} options.ignoreCase [false] - Should ignore casing when sorting
 */

/**
 * getPerfectionistRules
 * @param {CommonPerfectionistRules} options
 */
function getPerfectionistRules(options) {
  const naturalConfig = perfectionist.configs["recommended-natural"];

  return withCommonConfig(
    {
      ...naturalConfig.rules,
      "perfectionist/sort-jsx-props": [
        "error",
        {
          order: "asc",
          type: "natural",
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        {
          groups: [
            ["builtin", "external", "type"],
            ["internal", "internal-type"],
            ["parent-type", "parent"],
            ["index-type", "index"],
            ["sibling-type", "sibling"],
            "side-effect",
            "style",
            "object",
            "unknown",
          ],
          newlinesBetween: "always",
          order: "asc",
          type: "natural",
        },
      ],
      "perfectionist/sort-objects": [
        "error",
        {
          order: "asc",
          partitionByComment: true,
          type: "natural",
        },
      ],
    },
    options,
  );

  /**
   * withCommonConfig
   * Easily apply common config to all rules. Eg, ignoreCase default changed with perfectionist v3
   *
   * @param {Object} rules
   * @param {CommonPerfectionistRules} options
   */
  function withCommonConfig(rules, { ignoreCase = false } = {}) {
    return Object.fromEntries(
      Object.entries(rules).map(([ruleKey, ruleConfig]) => {
        const [level, config] = Array.isArray(ruleConfig)
          ? ruleConfig
          : [ruleConfig, {}];

        const newRule = [
          ruleKey,
          [
            level,
            {
              ...config,
              ignoreCase,
            },
          ],
        ];

        return newRule;
      }),
    );
  }
}
