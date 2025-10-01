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

      // Airbnb 风格规则
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
      indent: ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'space-in-parens': ['error', 'never'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // 使用 TypeScript 版本
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off', // Vue 项目中可能有路径解析问题

      // Vue 特定规则
      'vue/multi-word-component-names': 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'never',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 3,
          multiline: 1,
        },
      ],
      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['error', 2, { baseIndent: 0 }],

      // Prettier 集成
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          useTabs: false,
          endOfLine: 'lf',
          printWidth: 120,
          arrowParens: 'avoid',
          trailingComma: 'all',
          bracketSpacing: true,
          htmlWhitespaceSensitivity: 'ignore',
          proseWrap: 'preserve',
        },
      ],
    },
  },
  // Prettier 配置必须放在最后以覆盖冲突的规则
  prettierConfig,
];
