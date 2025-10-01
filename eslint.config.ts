import vue from 'eslint-plugin-vue';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,ts,vue}'],
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.d.ts',
      'vite.config.ts',
      'tailwind.config.js',
      'components.json',
      'src/components/ui/**/*', // 排除 UI 组件目录
    ],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      ...vue.configs.essential.rules,
      ...vue.configs['strongly-recommended'].rules,
      ...vue.configs.recommended.rules,

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      // 自定义规则
      'vue/multi-word-component-names': 'off',
      'prettier/prettier': 'warn',
    },
  },
  // Prettier 配置必须放在最后以覆盖冲突的规则
  prettierConfig,
];
