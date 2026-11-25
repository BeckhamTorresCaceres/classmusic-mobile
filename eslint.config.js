// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const FEATURES = ['auth', 'search', 'downloads', 'local', 'player', 'settings'];

function featureBoundaryConfig(feature) {
  const otherFeaturePatterns = FEATURES.filter((f) => f !== feature).map((f) => ({
    group: [`@/features/${f}`, `@/features/${f}/*`],
    message: `Las features no deben importarse entre sí; mueve la lógica compartida a @/shared, @/services o @/store.`,
  }));

  return {
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': ['error', { patterns: otherFeaturePatterns }],
    },
  };
}

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/theme/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/shared*',
            '@/services*',
            '@/store*',
            '@/features*',
            '@/navigation*',
            '@/shell*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/features*', '@/navigation*', '@/shell*'],
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/store*', '@/features*', '@/navigation*', '@/shell*'],
        },
      ],
    },
  },
  {
    files: ['src/store/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/features*', '@/navigation*', '@/shell*'],
        },
      ],
    },
  },
  ...FEATURES.map(featureBoundaryConfig),
]);
