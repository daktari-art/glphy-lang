#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GlyphParser } from './compiler/parser.js';
import { GlyphEngine } from './runtime/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GlyphCLI {
    constructor() {
        this.parser = new GlyphParser();
        this.engine = new GlyphEngine();
    }

    async run() {
        try {
            const args = process.argv.slice(2);
            
            if (args.length === 0 || args.includes('--help')) {
                this.showHelp();
                return;
            }

            if (args.includes('--version')) {
                this.showVersion();
                return;
            }

            const command = args[0];
            const filename = args[1];

            if (!filename) {
                throw new Error('Please specify a .glyph file');
            }

            const filepath = resolve(process.cwd(), filename);
            const source = readFileSync(filepath, 'utf8');

            console.log('🔮 Glyph Language - Executing:', filename);
            console.log('=' .repeat(50));

            const ast = this.parser.parse(source);
            
            if (command === 'parse') {
                console.log('📄 Abstract Syntax Tree:');
                console.log(JSON.stringify(ast, null, 2));
            } else if (command === 'run') {
                this.engine.loadProgram(ast);
                const result = await this.engine.execute();
                
                console.log('\n' + '=' .repeat(50));
                console.log('🎯 EXECUTION COMPLETE');
                console.log('=' .repeat(50));
                
                if (result.success) {
                    console.log('✅ SUCCESS: Program executed without errors');
                } else {
                    console.log('❌ FAILED: Program encountered errors');
                }
                
                console.log('\n📊 OUTPUT:');
                result.output.forEach(line => console.log('  ' + line));
                
                if (result.variables && Object.keys(result.variables).length > 0) {
                    console.log('\n💾 VARIABLES:');
                    Object.entries(result.variables).forEach(([key, value]) => {
                        console.log(`  ${key} = ${value}`);
                    });
                }
                
            } else {
                throw new Error(`Unknown command: ${command}`);
            }

        } catch (error) {
            console.error('\n💥 CRITICAL ERROR:');
            console.error('  ' + error.message);
            console.error('\n💡 TIP: Use `glyph --help` for usage information');
            process.exit(1);
        }
    }

    showHelp() {
        console.log(`
🔮 GLYPH LANGUAGE - VISUAL DATA FLOW PROGRAMMING

USAGE:
  glyph run <file.glyph>      Execute a Glyph program
  glyph parse <file.glyph>    Parse and display AST

EXAMPLES:
  glyph run examples/hello-world.glyph
  glyph parse examples/fibonacci.glyph

OPTIONS:
  --help      Show this help message
  --version   Show version information

QUICK START:
  1. Create a .glyph file with your program
  2. Run: glyph run your-program.glyph
  3. See execution results and output

GITHUB: https://github.com/daktari-art/glphy-lang
        `);
    }

    showVersion() {
        const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json')));
        console.log(`🔮 Glyph Language v${pkg.version}`);
        console.log('Visual Data Flow Programming Language');
    }
}

// Execute CLI
new GlyphCLI().run();
