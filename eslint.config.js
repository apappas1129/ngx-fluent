// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.strict, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
  // Legacy NgModule example — intentionally non-standalone, zone-based, constructor injection.
  {
    files: ['projects/ngx-fluent-example/**/*.ts'],
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/prefer-inject': 'off',
    },
  },
);
