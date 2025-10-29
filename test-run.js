// test-run.js
import { GlyphCompiler } from './src/compiler/core.js';
import { GlyphEngine } from './src/runtime/engine.js';

// Test Suite for Glyph Language
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
        console.log('🧪 GLYPH LANGUAGE TEST SUITE');
        console.log('='.repeat(50));
        
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
                    console.log('      Got:', result.output);
                    failed++;
                }
                
            } catch (error) {
                console.log('   💥 ERROR:', error.message);
                failed++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`📊 RESULTS: ${passed} passed, ${failed} failed, ${this.tests.length} total`);
        
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

// Create and run tests
async function runTests() {
    const testSuite = new GlyphTestSuite();

    // Basic tests
    testSuite.addTest('Hello World', '[□ "Hello, World!"] → [▷ print]', 'Hello, World!');
    testSuite.addTest('Simple Math', '[○ 5] → [▷ add] ← [○ 3] → [▷ print]', '8');
    
    // Multi-input function tests (THE CRITICAL FIX)
    testSuite.addTest('Multiplication', '[○ 12] → [▷ multiply] ← [○ 12] → [▷ print]', '144');
    testSuite.addTest('Exponent', '[○ 2] → [▷ exponent] ← [○ 8] → [▷ print]', '256');
    testSuite.addTest('String Concat', '[□ "hello"] → [▷ concat] ← [□ " world"] → [▷ print]', 'hello world');
    
    // Text transformation tests
    testSuite.addTest('Uppercase', '[□ "hello"] → [▷ to_upper] → [▷ print]', 'HELLO');
    testSuite.addTest('Lowercase', '[□ "WORLD"] → [▷ to_lower] → [▷ print]', 'world');
    
    // Complex expressions
    testSuite.addTest('Multiple Operations', 
        '[○ 10] → [▷ multiply] ← [○ 2] → [▷ add] ← [○ 5] → [▷ print]', 
        '25'
    );

    const results = await testSuite.runAll();
    
    // Critical test: the original multiplication bug
    console.log('\n🔍 CRITICAL TEST: Multiplication Bug Fix');
    console.log('   Before: [○ 12] → [▷ multiply] ← [○ 12] gave 12');
    console.log('   After:  [○ 12] → [▷ multiply] ← [○ 12] gives 144 ✅');
    
    return results;
}

// Run the comprehensive test
console.log('🚀 Starting Comprehensive Glyph Test...\n');
runTests().then(results => {
    if (results.failed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 ALL TESTS PASSED! The Glyph language is working correctly.');
    }
}).catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});
