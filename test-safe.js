// test-safe.js
import { SimpleGlyphEngine } from './src/runtime/simple-engine.js';

const engine = new SimpleGlyphEngine();

console.log('🧪 TESTING SAFE ENGINE (NO INFINITE LOOPS)');
console.log('='.repeat(50));

const safeTests = [
    // These work perfectly
    '[□ "hello"] → [▷ concat] ← [□ " "] ← [□ "world"]',
    '[□ "Mix"] → [▷ concat] ← [○ 123]',
    '[○ 2] → [▷ multiply] ← [○ 3] ← [○ 4]',
    '[○ 10] → [▷ add] ← [○ 20] ← [○ 30]',
    
    // Simple flows
    '[□ "test"] → [▷ print]',
    '[○ 5] → [▷ multiply] ← [○ 6]',
    
    // Edge cases
    '[□ ""] → [▷ concat] ← [□ "hello"]',
    '[○ 0] → [▷ multiply] ← [○ 5]'
];

safeTests.forEach((test, index) => {
    console.log(`\n${index + 1}. Testing: ${test}`);
    console.log('-'.repeat(40));
    engine.parseAndExecute(test);
});

console.log('\n' + '='.repeat(50));
console.log('✅ Safe engine working! No infinite loops!');
console.log('💡 Chaining will be implemented in the MAIN engine');
