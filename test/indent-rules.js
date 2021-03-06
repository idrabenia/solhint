const assert = require('assert');
const { assertErrorMessage, assertNoErrors } = require('./common/asserts');
const { noIndent } = require('./common/configs');
const linter = require('./../lib/index');
const { funcWith, contractWith, multiLine } = require('./common/contract-builder');


describe('Linter', function() {
    describe('Indent Rules', function () {

        it('should raise error when contract do not surrounds with two blank lines', function () {
            const code = `
            contract A {}
            
            contract B {}
            `;

            const report = linter.processStr(code, noIndent());

            assert.equal(report.errorCount, 2);
            assertErrorMessage(report, 0, 'two blank');
        });

        it('should not raise error when contract do not surrounds with two blank lines', function () {
            const code = `
            contract A {}
            
            
            contract B {}
            
            
            contract C {}
            `;

            const report = linter.processStr(code, noIndent());

            assertNoErrors(report);
        });

        it('should raise error about mixed tabs and spaces', function () {
            const code = ' \t import "lib.sol";';

            const report = linter.processStr(code, noIndent());

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'Mixed tabs and spaces');
        });

        it('should raise error when line indent is incorrect', function () {
            const code = '\t\timport "lib.sol";';

            const report = linter.processStr(code, {rules: { indent:['error', 'tabs'] } });

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'indent');
        });

        it('should raise error when line indent is incorrect', function () {
            const code = '\t\timport "lib.sol";';

            const report = linter.processStr(code, {rules: { indent:['error', 'tabs'] } });

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'indent');
        });

        it('should raise error when line indent is incorrect', function () {
            const code = multiLine(
                '    contract A {        ',
                '        uint private a; ',
                '    }                   '
            );

            const report = linter.processStr(code);

            assert.equal(report.errorCount, 3);
            assertErrorMessage(report, 0, '0');
            assertErrorMessage(report, 1, '4');
            assertErrorMessage(report, 2, '0');
        });

        it('should raise error when line indent is incorrect for function', function () {
            const code = multiLine(
                '    contract A {                  ',
                '        uint private a;           ',
                '        function A() private {    ',
                '      }                           ',
                '    }                             '
            );

            const report = linter.processStr(code, {rules:
                {'separate-by-one-line-in-contract': false, 'no-empty-blocks': false}
            });

            assert.equal(report.errorCount, 5);
            assertErrorMessage(report, 0, 'Expected indentation of 0');
            assertErrorMessage(report, 1, 'Expected indentation of 4');
            assertErrorMessage(report, 2, 'Expected indentation of 4');
            assertErrorMessage(report, 3, 'Expected indentation of 4');
            assertErrorMessage(report, 4, 'Expected indentation of 0');
        });

        it('should raise error when line indent is incorrect for function with for loop', function () {
            const code = multiLine('                     ', // 1
                '    contract A {                        ', // 2
                '        uint private a;                 ', // 3
                '        function A() private {          ', // 4
                '    for (uint a; a < b; a += 1)         ', // 5
                '            break;                      ', // 6
                '      }                                 ', // 7
                '    }                                   '  // 8
            );

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 6);
            assertErrorMessage(report, 0, 'Expected indentation of 0');
            assertErrorMessage(report, 1, 'Expected indentation of 4');
            assertErrorMessage(report, 2, 'Expected indentation of 4');
            assertErrorMessage(report, 3, 'Expected indentation of 8');
            assertErrorMessage(report, 4, 'Expected indentation of 4');
            assertErrorMessage(report, 5, 'Expected indentation of 0 spaces');
        });

        it('should raise error when line indent is incorrect for function with for while loop', function () {
            const code = multiLine('                   ', // 1
                '    contract A {                      ', // 2
                '        uint private a;               ', // 3
                '        function A() private {        ', // 4
                '    while (a < b)                     ', // 5
                '            return;                   ', // 6
                '      }                               ', // 7
                '    }                                 '  // 8
            );

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 6);
            assertErrorMessage(report, 0, 'Expected indentation of 0 spaces');
            assertErrorMessage(report, 1, 'Expected indentation of 4');
            assertErrorMessage(report, 2, 'Expected indentation of 4');
            assertErrorMessage(report, 3, 'Expected indentation of 8');
            assertErrorMessage(report, 4, 'Expected indentation of 4');
            assertErrorMessage(report, 5, 'Expected indentation of 0');
        });

        it('should raise error when line indent is incorrect for function with for if statement', function () {
            const code = multiLine('                  ', // 1
                '    contract A {                     ', // 2
                '        uint private a;              ', // 3
                '        function A() private {       ', // 4
                '    if (a < b) {                     ', // 5
                '            a += 1;                  ', // 6
                '        b -= 1;                      ', // 7
                '            continue;                ', // 8
                '        }                            ', // 9
                '      }                              ', // 10
                '    }                                '  // 11
            );

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 7);
            assertErrorMessage(report, 0, 'Expected indentation of 0 spaces');
            assertErrorMessage(report, 1, 'Expected indentation of 4');
            assertErrorMessage(report, 2, 'Expected indentation of 4');
            assertErrorMessage(report, 3, 'Expected indentation of 8');
            assertErrorMessage(report, 4, 'Expected indentation of 12');
            assertErrorMessage(report, 5, 'Expected indentation of 4');
            assertErrorMessage(report, 6, 'Expected indentation of 0');
        });

        it('should not raise error when line indent is correct for function with for if-else statement', function () {
            const code = multiLine('              ', // 1
                'contract A {                     ', // 2
                '    function A() private {       ', // 3
                '        if (a < b) {             ', // 4
                '            a += 1;              ', // 5
                '        } else {                 ', // 6
                '            b -= 1;              ', // 7
                '        }                        ', // 8
                '    }                            ', // 9
                '}                                '  // 10
            );

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assertNoErrors(report);
        });

        it('should raise error when line indent is not correct for function with for assembly statement', function () {
            const code = multiLine('              ', // 1
                'contract A {                     ', // 2
                '    function A() private {       ', // 3
                '        assembly {               ', // 4
                '         {}                      ', // 5
                '        }                        ', // 6
                '    }                            ', // 7
                '}                                '  // 8
            );

            const report = linter.processStr(code, {rules:
                {'separate-by-one-line-in-contract': false, 'no-empty-blocks': false}
            });

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'Indentation is incorrect');
        });

        it('should not raise error when line indent is correct for function with for if-else statement', function () {
            const code = multiLine('               ', // 1
                'contract A {                      ', // 2
                '    function A() private {        ', // 3
                '        if (                      ', // 4
                '            a < b                 ', // 5
                '        ) {                       ', // 6
                '            a += 1;               ', // 7
                '        } else {                  ', // 8
                '            b -= 1;               ', // 9
                '        }                         ', // 10
                '    }                             ', // 11
                '}                                 '  // 12
            );

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assertNoErrors(report);
        });

        it('should not raise error for custom configured indent rules', function () {
            const code = multiLine('',
                'contract A {              ',
                '\tuint private a = 0;     ',
                '\tfunction A() {          ',
                '\t\t\tuint a = 5;         ',
                '\t}                       ',
                '}                         '
            );

            const report = linter.processStr(code, {
                rules: {
                    indent: ['warn', 'tabs'],
                    'func-visibility': false,
                    'separate-by-one-line-in-contract': false
                }
            });

            assert.equal(report.warningCount, 1);
            assertErrorMessage(report, 0, 'Expected indentation of 2 tabs');
        });

        it('should raise error when bracket incorrect aligned', function () {
            const code = funcWith(`
                for (uint i = 0; i < a; i += 1) 
                {
                  continue;
                }
            `);

            const report = linter.processStr(code, noIndent());

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'Open bracket');
        });

        it('should raise error when array declaration has spaces', function () {
            const code = contractWith('uint [] [] private a;');

            const report = linter.processStr(code, noIndent());

            assert.equal(report.errorCount, 2);
            assertErrorMessage(report, 0, 'Array declaration');
            assertErrorMessage(report, 1, 'Array declaration');
        });

        it('should not raise error for array declaration', function () {
            const code = contractWith('uint[][] private a;');

            const report = linter.processStr(code, noIndent());

            assertNoErrors(report);
        });

        it('should raise error when items inside contract do not separated by new line', function () {
            const code = contractWith(`
                function a() public {
                }
                function b() public {}
            `);

            const report = linter.processStr(code, noIndent());

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'must be separated by one line');
        });

        it('should not raise error when items inside contract separated by new line', function () {
            const code = contractWith(`
                function a() public {
                }
                
                // any comment
                function b() public {}
            `);

            const report = linter.processStr(code, noIndent());

            assertNoErrors(report);
        });

        it('should not raise error when items inside contract separated by new line with comments', function () {
            const code = contractWith(`
                function a() public {
                }
                
                /**
                 * Function b
                 */
                function b() public {}
            `);

            const report = linter.processStr(code, noIndent());

            assertNoErrors(report);
        });

        it('should raise error when line length exceed 120', function () {
            const code = ' '.repeat(121);

            const report = linter.processStr(code, noIndent());

            assert.equal(report.errorCount, 1);
            assertErrorMessage(report, 0, 'Line length must be no more than');
        });

        it('should not raise error when line length exceed 120 and custom config provided', function () {
            const code = ' '.repeat(130);

            const report = linter.processStr(code, {
                rules: { indent: false, 'max-line-length': ['error', 130] }
            });

            assertNoErrors(report);
        });

    });
});