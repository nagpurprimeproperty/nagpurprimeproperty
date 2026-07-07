import js from "@eslint/js";

export default [
  // Base recommended rules
  js.configs.recommended,

  // 🌐 Node.js environment (fixes process, console, require, etc.)
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
      },
    },
  },

  // 🧪 Jest test environment (fixes describe, it, expect, etc.)
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },

  // ⚙️ Custom rules
  {
    rules: {
      "no-unused-vars": "warn",   // don't fail CI for unused vars
      "no-console": "off",       // allow console.log
      "no-undef": "error",       // still catch real undefined vars
    },
  },
];