// test-comprehensive.js
import { SimpleGlyphEngine } from './src/runtime/simple-engine.js';

const engine = new SimpleGlyphEngine();

console.log('🧪 COMPREHENSIVE GLYPH ENGINE TESTS');
console.log('='.repeat(60));
console.log('Testing edge cases and complex multi-input scenarios');
console.log('='.repeat(60));

const comprehensiveTests = [
    // Basic arithmetic
    '[○ 2] → [▷ multiply] ← [○ 3] ← [○ 4]',  // Triple multiplication
    '[○ 10] → [▷ add] ← [○ 20] ← [○ 30]',    // Triple addition
    
    // Mixed operations
    '[○ 5] → [▷ multiply] ← [○ 6] → [▷ add] ← [○ 10]', // Chained operations
    
    // Text operations
    '[□ "hello"] → [▷ concat] ← [□ " "] ← [□ "world"]', // Triple concat
    '[□ "Mix"] → [▷ concat] ← [○ 123]',                 // Mixed types
    
    // Complex flows
    '[○ 2] → [▷ multiply] ← [○ 3] → [▷ multiply] ← [○ 4] → [▷ print]',
    '[□ "Result:"] → [▷ concat] ← [○ 100] → [▷ print]',
    
    // Edge cases
    '[○ 0] → [▷ multiply] ← [○ 5]',                    // Zero multiplication
    '[○ 1] → [▷ multiply] ← [○ 1] ← [○ 1] ← [○ 1]',   // Many inputs
    '[□ ""] → [▷ concat] ← [□ "hello"]',               // Empty string
    
    // What should FAIL (currently not supported)
    '[○ 5] → [○ 6]',                                   // No function
    '[▷ multiply] ← [○ 5]',                            // Missing first input
    '[○ 5] → [▷ unknown] ← [○ 6]',                     // Unknown function
];

let passed = 0;
let failed = 0;

comprehensiveTests.forEach((test, index) => {
    console.log(`\n${index + 1}. Testing: ${test}`);
    console.log('-'.repeat(50));
    
    try {
        engine.parseAndExecute(test);
        passed++;
        console.log('✅ Test executed');
    } catch (error) {
        failed++;
        console.log('❌ Test failed:', error.message);
    }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 RESULTS: ${passed} passed, ${failed} failed, ${comprehensiveTests.length} total`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Multi-input concept is solid!');
    console.log('🚀 Ready to build the full parser around this foundation!');
} else {
    console.log('⚠️ Some tests failed - these reveal where we need to improve the parser');
    console.log('💡 This is NORMAL for language development!');
}
