#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import GlyphCompiler from './compiler/core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
    console.log(`
🔮 Glyph Language v0.1.0

Usage:
  glyph compile <file.glyph>
  glyph run <file.glyph>
  
Examples:
  glyph compile examples/hello-world.glyph
  glyph run examples/hello-world.glyph

Options:
  --help     Show this help
  --version  Show version
    `);
    process.exit(0);
}

if (args.includes('--version')) {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json')));
    console.log(`Glyph Language v${pkg.version}`);
    process.exit(0);
}

const command = args[0];
const filename = args[1];

if (!filename) {
    console.error('❌ Please specify a .glyph file');
    process.exit(1);
}

try {
    const glyphCode = readFileSync(filename, 'utf8');
    const compiler = new GlyphCompiler();
    
    if (command === 'compile') {
        const ast = compiler.parse(glyphCode);
        const jsCode = compiler.compileToJS(ast);
        
        const outputFile = filename.replace('.glyph', '.js');
        writeFileSync(outputFile, jsCode);
        console.log(`✅ Compiled ${filename} → ${outputFile}`);
        
    } else if (command === 'run') {
        const ast = compiler.parse(glyphCode);
        const jsCode = compiler.compileToJS(ast);
        
        // Execute the generated code
        console.log('🔮 Executing Glyph program...');
        eval(jsCode);
        
    } else {
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
