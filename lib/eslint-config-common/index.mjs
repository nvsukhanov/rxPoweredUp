import stylistic from '@stylistic/eslint-plugin';
import tsEslint from 'typescript-eslint';
import jsEslint from '@eslint/js';
import eslintImport from 'eslint-plugin-import';

export default [{
    plugins: {
        '@stylistic': stylistic,
    },
    languageOptions: {
        parser: tsEslint.parser,
    },
    rules: {
        'no-console': [
            'error',
            {
                'allow': [
                    'warn',
                    'error'
                ]
            }
        ],
        '@stylistic/arrow-spacing': 'error',
        '@stylistic/arrow-parens': 'error',
        '@stylistic/brace-style': 'error',
        '@stylistic/computed-property-spacing': 'error',
        '@stylistic/key-spacing': [
            'error',
            {
                'beforeColon': false,
                'afterColon': true
            }
        ],
        '@stylistic/keyword-spacing': 'error',
        '@stylistic/lines-between-class-members': 'error',
        '@stylistic/max-len': [
            'error',
            {
                'code': 160,
                'ignoreComments': true
            }
        ],
        '@stylistic/max-statements-per-line': [
            'error',
            {
                'max': 1
            }
        ],
        '@stylistic/member-delimiter-style': 'error',
        '@stylistic/new-parens': 'error',
        '@stylistic/no-confusing-arrow': 'error',
        '@stylistic/no-floating-decimal': 'error',
        '@stylistic/no-multi-spaces': 'error',
        '@stylistic/no-multiple-empty-lines': 'error',
        '@stylistic/no-whitespace-before-property': 'error',
        '@stylistic/one-var-declaration-per-line': 'error',
        '@stylistic/operator-linebreak': [
            'error',
            'before'
        ],
        '@stylistic/padded-blocks': [
            'error',
            'never'
        ],
        '@stylistic/semi': 'error',
        '@stylistic/quotes': [
            'error',
            'single'
        ],
        '@stylistic/quote-props': [
            'error',
            'consistent-as-needed'
        ],
        '@stylistic/space-before-blocks': 'error',
        '@stylistic/space-before-function-paren': [
            'error',
            {
                'anonymous': 'always',
                'named': 'never',
                'asyncArrow': 'always'
            }
        ],
        '@stylistic/space-in-parens': 'error',
        '@stylistic/space-infix-ops': 'error',
        '@stylistic/spaced-comment': 'error',
        '@stylistic/switch-colon-spacing': 'error',
        '@stylistic/template-curly-spacing': 'error',
        '@stylistic/type-annotation-spacing': 'error',
        '@stylistic/type-generic-spacing': 'error',
        '@stylistic/type-named-tuple-spacing': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/member-ordering': [
            'error',
            {
                'default': [
                    'public-static-field',
                    'protected-static-field',
                    'private-static-field',
                    'public-static-method',
                    'protected-static-method',
                    'private-static-method',
                    'public-abstract-field',
                    'protected-abstract-field',
                    'public-instance-field',
                    'protected-instance-field',
                    'private-instance-field',
                    'constructor',
                    'public-abstract-method',
                    'protected-abstract-method',
                    [
                        'get',
                        'set'
                    ],
                    'public-instance-method',
                    'protected-instance-method',
                    'private-instance-method'
                ]
            }
        ],
        '@typescript-eslint/no-inferrable-types': [
            'error',
            {
                'ignoreParameters': true
            }
        ],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                'selector': 'variable',
                'modifiers': [
                    'const',
                    'exported'
                ],
                'format': [
                    'UPPER_CASE'
                ]
            },
            {
                'selector': 'parameter',
                'format': [
                    'camelCase'
                ],
                'leadingUnderscore': 'allow'
            },
            {
                'selector': 'typeLike',
                'format': [
                    'PascalCase'
                ]
            },
            {
                'selector': 'interface',
                'format': [
                    'PascalCase'
                ],
                'custom': {
                    'regex': '^I[A-Z]',
                    'match': true
                }
            }
        ],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        'import/no-cycle': [
            'error',
            {
                'maxDepth': 1
            }
        ],
        'import/order': [
            'error',
            {
                'groups': [
                    [
                        'external',
                        'internal'
                    ]
                ],
                'newlines-between': 'always',
                'distinctGroup': false
            }
        ],
        'sort-imports': [
            'error',
            {
                'allowSeparatedGroups': true,
                'ignoreDeclarationSort': true
            }
        ],
        'import/no-useless-path-segments': [
            'error',
            {
                'noUselessIndex': true
            }
        ],
        'import/no-self-import': [
            'error'
        ],
        'import/exports-last': [
            'error'
        ],
        'import/no-duplicates': [
            'error'
        ],
        'import/first': [
            'error'
        ],
        'import/newline-after-import': [
            'error'
        ],
        'import/no-mutable-exports': [
            'error'
        ]
    }
},
    jsEslint.configs.recommended,
    ...tsEslint.configs.recommended,
    eslintImport.flatConfigs.recommended,
    eslintImport.flatConfigs.typescript,
    eslintImport.flatConfigs.errors,
    eslintImport.flatConfigs.warnings,
];
