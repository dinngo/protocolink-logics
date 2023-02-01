module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
