#!/usr/bin/env node
import { readFileSync } from 'fs';
import { GlyphParser } from './compiler/parser.js';
import { GlyphEngine } from './runtime/engine.js';

class GlyphCLI {
    constructor() {
        this.parser = new GlyphParser();
        this.engine = new GlyphEngine();
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0];
        const filename = args[1];

        if (!command || !filename) {
            this.showHelp();
            return;
        }

        try {
            const source = readFileSync(filename, 'utf8');
            
            if (command === 'parse') {
                const ast = this.parser.parse(source);
                console.log('📄 AST:', JSON.stringify(ast, null, 2));
            } else if (command === 'run') {
                await this.execute(source);
            } else {
                console.error('❌ Unknown command:', command);
            }
        } catch (error) {
            console.error('💥 Error:', error.message);
        }
    }

    async execute(source) {
        console.log('🔮 Glyph Language Runtime');
        console.log('========================\n');
        
        const ast = this.parser.parse(source);
        this.engine.loadProgram(ast);
        const result = await this.engine.execute();
        
        console.log('\n📊 Execution Summary:');
        console.log('===================');
        console.log('Success:', result.success);
        console.log('Final Output:', result.finalOutput);
    }

    showHelp() {
        console.log(`
🔮 Glyph Language v0.1.0

Usage:
  glyph parse <file.glyph>    # Parse and show AST
  glyph run <file.glyph>      # Execute program

Examples:
  glyph run examples/hello-world.glyph
  glyph parse examples/fibonacci.glyph

GitHub: https://github.com/daktari-art/glphy-lang
        `);
    }
}

// Run CLI
new GlyphCLI().run();
