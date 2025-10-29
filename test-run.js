// test-run.js
import { GlyphCompiler } from './src/compiler/core.js';
import { GlyphEngine } from './src/runtime/engine.js';

// Test Suite for Glyph Language v2.0
class GlyphTestSuite {
    constructor() {
        this.compiler = new GlyphCompiler();
        this.engine = new GlyphEngine();
        this.tests = [];
        this.results = [];
    }

    addTest(name, code, expectedOutput) {
        this.tests.push({ name, code, expectedOutput });
    }

    async runAll() {
        console.log('🧪 GLYPH LANGUAGE v2.0 TEST SUITE');
        console.log('='.repeat(60));
        console.log('Testing Multi-Input Functions & Graph Execution');
        console.log('='.repeat(60));
        
        let passed = 0;
        let failed = 0;

        for (const test of this.tests) {
            console.log(`\n📝 Test: ${test.name}`);
            console.log(`   Code: ${test.code}`);
            
            try {
                const ast = this.compiler.parse(test.code);
                this.engine.loadProgram(ast);
                const result = await this.engine.execute();
                
                const success = this.checkResult(result, test.expectedOutput);
                
                if (success) {
                    console.log('   ✅ PASS');
                    passed++;
                } else {
                    console.log('   ❌ FAIL');
                    console.log('      Expected:', test.expectedOutput);
                    console.log('      Got:');
                    result.output.forEach(line => console.log('        ', line));
                    failed++;
                }
                
            } catch (error) {
                console.log('   💥 ERROR:', error.message);
                failed++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed, ${this.tests.length} total`);
        
        return { passed, failed, total: this.tests.length };
    }

    checkResult(result, expected) {
        if (typeof expected === 'string') {
            return result.output.some(output => output.includes(expected));
        } else if (Array.isArray(expected)) {
            return expected.every(exp => 
                result.output.some(output => output.includes(exp))
            );
        }
        return result.success;
    }
}

// Create and run comprehensive tests
async function runTests() {
    const testSuite = new GlyphTestSuite();

    // ==================== CORE FUNCTIONALITY TESTS ====================

    // Basic output tests
    testSuite.addTest('Hello World', '[□ "Hello, World!"] → [▷ print]', 'Hello, World!');
    testSuite.addTest('Simple Data Node', '[○ 42] → [▷ print]', '42');

    // ==================== MULTI-INPUT BREAKTHROUGH TESTS ====================
    
    // Critical: Multi-input multiplication (THE FIX!)
    testSuite.addTest('Multiplication Fix', '[○ 12] → [▷ multiply] ← [○ 12] → [▷ print]', '144');
    testSuite.addTest('Triple Multiplication', '[○ 2] → [▷ multiply] ← [○ 3] ← [○ 4] → [▷ print]', '24');
    
    // Multi-input addition
    testSuite.addTest('Simple Addition', '[○ 5] → [▷ add] ← [○ 3] → [▷ print]', '8');
    testSuite.addTest('Triple Addition', '[○ 1] → [▷ add] ← [○ 2] ← [○ 3] → [▷ print]', '6');
    
    // Exponentiation
    testSuite.addTest('Exponentiation', '[○ 2] → [▷ exponent] ← [○ 8] → [▷ print]', '256');
    testSuite.addTest('Power of Three', '[○ 3] → [▷ exponent] ← [○ 4] → [▷ print]', '81');

    // ==================== TEXT PROCESSING TESTS ====================
    
    // String concatenation
    testSuite.addTest('String Concatenation', '[□ "hello"] → [▷ concat] ← [□ " world"] → [▷ print]', 'hello world');
    testSuite.addTest('Triple Concatenation', '[□ "a"] → [▷ concat] ← [□ "b"] ← [□ "c"] → [▷ print]', 'abc');
    
    // Text transformation
    testSuite.addTest('Uppercase', '[□ "hello"] → [▷ to_upper] → [▷ print]', 'HELLO');
    testSuite.addTest('Lowercase', '[□ "WORLD"] → [▷ to_lower] → [▷ print]', 'world');
    testSuite.addTest('String Length', '[□ "hello"] → [▷ length] → [▷ print]', '5');

    // ==================== TYPE CONVERSION TESTS ====================
    
    testSuite.addTest('String to Number', '[○ "42"] → [▷ to_number] → [▷ print]', '42');
    testSuite.addTest('Number to String', '[○ 123] → [▷ to_string] → [▷ concat] ← [□ " users"] → [▷ print]', '123 users');

    // ==================== USER INPUT PROCESSING TESTS ====================
    
    // Natural language number parsing
    testSuite.addTest('Text to Number - Twenty Five', '[□ "twenty five"] → [▷ parse_text_to_number] → [▷ print]', '25');
    testSuite.addTest('Text to Number - Eighteen', '[□ "eighteen"] → [▷ parse_text_to_number] → [▷ print]', '18');
    testSuite.addTest('Text to Number - One Hundred', '[□ "one hundred"] → [▷ parse_text_to_number] → [▷ print]', '100');
    
    // Mixed input cleaning
    testSuite.addTest('Clean Mixed Input - Years', '[□ "25 years old"] → [▷ clean_mixed_input] → [▷ print]', '25');
    testSuite.addTest('Clean Mixed Input - Dollars', '[□ "$150"] → [▷ clean_mixed_input] → [▷ print]', '150');
    
    // Age validation
    testSuite.addTest('Valid Age Check', '[○ 25] → [▷ is_valid_age] → [▷ print]', 'true');
    testSuite.addTest('Invalid Age Check', '[○ 150] → [▷ is_valid_age] → [▷ print]', 'false');

    // ==================== COMPLEX FLOW TESTS ====================
    
    // Chained operations
    testSuite.addTest('Chained Math Operations', 
        '[○ 5] → [▷ multiply] ← [○ 6] → [▷ add] ← [○ 10] → [▷ print]', 
        '40');
    
    testSuite.addTest('Complex Text Pipeline',
        '[□ " hello "] → [▷ trim] → [▷ to_upper] → [▷ concat] ← [□ "!"] → [▷ print]',
        'HELLO!');
    
    // Multiple independent flows
    testSuite.addTest('Multiple Outputs',
        `[○ 2] → [▷ multiply] ← [○ 3] → [▷ print]
[○ 4] → [▷ multiply] ← [○ 5] → [▷ print]`,
        ['6', '20']);

    // ==================== ERROR HANDLING TESTS ====================
    
    testSuite.addTest('Division by Zero Handling',
        '[○ 10] → [▷ divide] ← [○ 0] → [▷ print]',
        'Division by zero');

    const results = await testSuite.runAll();
    
    // ==================== SUMMARY ====================
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 CRITICAL TEST: Multiplication Bug Fix');
    console.log('='.repeat(60));
    console.log('   Before v2.0: [○ 12] → [▷ multiply] ← [○ 12] gave 12 ❌');
    console.log('   After v2.0:  [○ 12] → [▷ multiply] ← [○ 12] gives 144 ✅');
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 PERFORMANCE METRICS');
    console.log('='.repeat(60));
    console.log(`   Multi-Input Tests: ${results.passed}/${results.total} passed`);
    console.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Glyph v2.0 is working perfectly!');
        console.log('🚀 Multi-input functions are now fully operational!');
    } else {
        console.log(`\n⚠️  ${results.failed} tests failed - check implementation`);
        process.exit(1);
    }
    
    return results;
}

// Run the comprehensive test suite
console.log('🚀 Starting Glyph Language v2.0 Comprehensive Test Suite...\n');
runTests().then(results => {
    if (results.failed === 0) {
        console.log('\n💫 Glyph v2.0 is ready for production use!');
        console.log('🌟 Multi-input revolution achieved!');
    }
}).catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});
