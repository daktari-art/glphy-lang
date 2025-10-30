// test-concat-fixes.js
import { SimpleGlyphEngine } from './src/runtime/simple-engine.js';

const engine = new SimpleGlyphEngine();

console.log('🧪 TESTING CONCATENATION FIXES');
console.log('='.repeat(50));

const concatTests = [
    // These should NOW work
    '[□ "hello"] → [▷ concat] ← [□ " "] ← [□ "world"]',
    '[□ "Mix"] → [▷ concat] ← [○ 123]',
    '[□ ""] → [▷ concat] ← [□ "hello"]',
    '[□ "Result:"] → [▷ concat] ← [○ 100]',
    
    // Edge cases
    '[□ "a"] → [▷ concat] ← [□ "b"] ← [□ "c"] ← [□ "d"]',
    '[□ "num:"] → [▷ concat] ← [○ 42] → [▷ concat] ← [□ "!"]'
];

concatTests.forEach((test, index) => {
    console.log(`\n${index + 1}. Testing: ${test}`);
    console.log('-'.repeat(40));
    engine.parseAndExecute(test);
});

console.log('\n' + '='.repeat(50));
console.log('🎯 Concatenation fixes applied!');
