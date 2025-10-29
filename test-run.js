import { GlyphCompiler } from './src/compiler/core.js';

// Test the compiler with hello-world
const compiler = new GlyphCompiler();
const helloWorldCode = '[□ "Hello, World!"] → [⤶ print]';

console.log('🧪 Testing Glyph Compiler...');
console.log('Input:', helloWorldCode);

const ast = compiler.parse(helloWorldCode);
console.log('AST:', JSON.stringify(ast, null, 2));

const jsCode = compiler.compileToJS(ast);
console.log('Generated JS:');
console.log(jsCode);

console.log('✅ Compiler test completed!');
