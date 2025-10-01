module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@prisma/client$": "<rootDir>/tests/__mocks__/@prisma/client.ts"
  },
  moduleDirectories: ["node_modules", "src"],
  transform: {
    '^.+\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
  },
};