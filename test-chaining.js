// test-chaining.js
import { SimpleGlyphEngine } from './src/runtime/simple-engine.js';

const engine = new SimpleGlyphEngine();

console.log('🧪 TESTING OPERATION CHAINING');
console.log('='.repeat(50));

const chainingTests = [
    '[□ "num:"] → [▷ concat] ← [○ 42] → [▷ concat] ← [□ "!"]',
    '[○ 2] → [▷ multiply] ← [○ 3] → [▷ multiply] ← [○ 4]',
    '[□ "Result: "] → [▷ concat] ← [○ 100] → [▷ print]',
    '[○ 5] → [▷ add] ← [○ 3] → [▷ multiply] ← [○ 2]'
];

chainingTests.forEach((test, index) => {
    console.log(`\n${index + 1}. Testing: ${test}`);
    console.log('-'.repeat(40));
    engine.parseAndExecute(test);
});

console.log('\n' + '='.repeat(50));
console.log('🎯 Chaining fixes applied!');
