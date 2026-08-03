/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/cli/src"],
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          strict: true,
          types: ["jest", "node"],
          paths: {
            "@config/*": ["./src/config/*"],
            "@lib/*": ["./src/lib/*"],
            "@api/*": ["./src/api/*"],
            "@stores/*": ["./src/stores/*"],
            "@utils/*": ["./src/utils/*"],
            "@contexts/*": ["./src/contexts/*"],
          },
        },
      },
    ],
  },
};
