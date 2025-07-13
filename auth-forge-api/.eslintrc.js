module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'turbo',
        'prettier',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'object-curly-spacing': ['error', 'always'],

        '@typescript-eslint/explicit-function-return-type': [
            'warn',
            {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
            },
        ],

        'comma-dangle': ['error', 'always-multiline'],

        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        'newline-before-return': 'error',

        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'variableLike',
                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            },
        ],

        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: 'import', next: '*' },
            { blankLine: 'always', prev: '*', next: 'function' },
            { blankLine: 'always', prev: '*', next: 'return' },
        ],
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        'prefer-const': 'error',
        eqeqeq: ['error', 'always'],
        curly: 'error',
        'no-implicit-coercion': 'error',
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],
    },
};
