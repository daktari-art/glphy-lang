// test-main-engine.js
import { GlyphCompiler } from './src/compiler/core.js';
import { GlyphEngine } from './src/runtime/engine.js';

const compiler = new GlyphCompiler();
const engine = new GlyphEngine();

console.log('🧪 TESTING FIXED MAIN ENGINE');
console.log('='.repeat(50));

const testCases = [
    {
        name: 'Multi-input Multiplication',
        code: '[○ 12] → [▷ multiply] ← [○ 12] → [▷ print]',
        expected: '144'
    },
    {
        name: 'Multi-text Concatenation', 
        code: '[□ "hello"] → [▷ concat] ← [□ " "] ← [□ "world"] → [▷ print]',
        expected: 'hello world'
    },
    {
        name: 'Mixed Type Concatenation',
        code: '[□ "Result: "] → [▷ concat] ← [○ 100] → [▷ print]',
        expected: 'Result: 100'
    },
    {
        name: 'Triple Multiplication',
        code: '[○ 2] → [▷ multiply] ← [○ 3] ← [○ 4] → [▷ print]',
        expected: '24'
    },
    {
        name: 'Text Transformation',
        code: '[□ "hello"] → [▷ to_upper] → [▷ print]',
        expected: 'HELLO'
    }
];

async function runTests() {
    let passed = 0;
    let failed = 0;

    for (const test of testCases) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log(`   Code: ${test.code}`);
        console.log('-'.repeat(40));
        
        try {
            const ast = compiler.parse(test.code);
            engine.loadProgram(ast);
            const result = await engine.execute();
            
            const success = result.output.some(output => output.includes(test.expected));
            
            if (success) {
                console.log('✅ PASS');
                passed++;
            } else {
                console.log('❌ FAIL');
                console.log('   Expected output containing:', test.expected);
                console.log('   Actual output:', result.output);
                failed++;
            }
            
        } catch (error) {
            console.log('💥 ERROR:', error.message);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESULTS: ${passed} passed, ${failed} failed, ${testCases.length} total`);
    
    if (failed === 0) {
        console.log('🎉 MAIN ENGINE FIXED! Multi-input breakthrough confirmed!');
    } else {
        console.log('⚠️ Some tests failed - check connection parsing');
    }
}

runTests();
