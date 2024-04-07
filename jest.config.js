const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const createNextJest = nextJest({
  dir: ".",
});
const jestConfig = createNextJest({
  moduleDirectories: ["node_modules", "<rootDir>"],
});

module.exports = jestConfig;
