#!/usr/bin/env node
// src/cli.js - v0.3.0
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, basename } from 'path';
import { GlyphCompiler } from './compiler/core.js';
import { GlyphEngine } from './runtime/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GlyphCLI {
    constructor() {
        this.compiler = new GlyphCompiler();
        this.engine = new GlyphEngine();
    }

    async run() {
        try {
            const args = process.argv.slice(2);
            
            if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
                this.showHelp();
                return;
            }

            if (args.includes('--version') || args.includes('-v')) {
                this.showVersion();
                return;
            }

            const command = args[0];
            const filename = args[1];

            if (!filename && !['repl', 'test'].includes(command)) {
                throw new Error('Please specify a .glyph file or use "glyph repl"');
            }

            switch (command) {
                case 'run':
                    await this.executeFile(filename);
                    break;
                case 'parse':
                    await this.parseFile(filename);
                    break;
                case 'compile':
                    await this.compileFile(filename);
                    break;
                case 'repl':
                    await this.startRepl();
                    break;
                case 'test':
                    console.log('Running test suite... (Use: npm test)');
                    break;
                default:
                    throw new Error(`Unknown command: ${command}`);
            }

        } catch (error) {
            this.handleError(error);
        }
    }

    async executeFile(filename) {
        if (!existsSync(filename)) {
            throw new Error(`File not found: ${filename}`);
        }
        const glyphCode = readFileSync(filename, 'utf8');

        console.log(`\n🔮 Executing ${basename(filename)}...`);
        const ast = this.compiler.parse(glyphCode);
        
        this.engine.loadProgram(ast);
        const result = await this.engine.execute();

        console.log('\n--- Execution Complete ---');
        console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`Executed Nodes: ${result.statistics.executedNodes}/${result.statistics.totalNodes}`);
        
        if (!result.success) {
            console.log('⚠️ Program failed due to an unhandled error.');
        }
    }

    async parseFile(filename) {
        if (!existsSync(filename)) {
            throw new Error(`File not found: ${filename}`);
        }
        const glyphCode = readFileSync(filename, 'utf8');

        console.log(`\n🔮 Parsing ${basename(filename)}...`);
        const ast = this.compiler.parse(glyphCode);
        
        console.log('\n--- Abstract Syntax Tree (AST) ---');
        console.log(JSON.stringify(ast, null, 2));
        console.log(`\nAST structure with connection mapping`);
        console.log('   Status: Ready for execution and type check');
    }

    async compileFile(filename) {
        if (!existsSync(filename)) {
            throw new Error(`File not found: ${filename}`);
        }
        const glyphCode = readFileSync(filename, 'utf8');

        console.log(`\n🔮 Compiling ${basename(filename)} to JavaScript...`);
        const ast = this.compiler.parse(glyphCode);
        const jsCode = this.compiler.compileToJS(ast);
        
        const outputFilename = filename.replace('.glyph', '.js');
        writeFileSync(outputFilename, jsCode, 'utf8');

        console.log(`\n✅ Successfully compiled to: ${outputFilename}`);
        console.log('   Note: Full compilation logic is a v0.4.0 target.');
    }

    async startRepl() {
        console.log('🔮 Glyph REPL (v0.3.0) - Enter Glyph code to execute.');
        console.log('Type ".exit" to quit.\n');

        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'glyph> '
        });

        rl.prompt();

        rl.on('line', async (line) => {
            if (line.trim().toLowerCase() === '.exit') {
                rl.close();
                return;
            }

            try {
                const ast = this.compiler.parse(line);
                this.engine.loadProgram(ast);
                const result = await this.engine.execute();

                if (result.success && result.output.length > 0) {
                    console.log(`=> ${result.output[result.output.length - 1].replace('📤 PRINT: ', '').trim()}`);
                } else if (!result.success) {
                    console.log('⚠️ Execution Failed.');
                }
            } catch (error) {
                console.error(`💥 REPL Error: ${error.message}`);
            }
            rl.prompt();
        }).on('close', () => {
            console.log('\nGoodbye!');
            process.exit(0);
        });
    }

    showHelp() {
        console.log(`
🔮 GLYPH LANGUAGE - VISUAL DATA FLOW PROGRAMMING (v0.3.0)

USAGE:
  glyph run <file.glyph>        Execute a Glyph program
  glyph parse <file.glyph>      Parse and display AST (includes Type Inference check)
  glyph compile <file.glyph>    Compile to JavaScript
  glyph repl                    Start interactive REPL
  glyph test                    Run test suite (npm test)

EXAMPLES:
  glyph run examples/fibonacci.glyph
  glyph parse examples/arithmetic.glyph
  glyph repl

OPTIONS:
  -h, --help      Show this help message
  -v, --version   Show version information

QUICK START:
  1. Create a .glyph file with type annotations: echo '[○ 5: number] → [▷ multiply] ← [○ 6: number] → [▷ print]' > test.glyph
  2. Run it: glyph run test.glyph
  3. See the magic happen! 🎉

GITHUB: https://github.com/daktari-art/glyph-lang
        `);
    }

    showVersion() {
        const pkgPath = resolve(__dirname, '../package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        console.log(`🔮 Glyph Language v${pkg.version}`);
        console.log('Visual Data Flow Programming Language with Type Inference and Scoping');
        console.log(`Node.js ${process.version}`);
    }

    handleError(error) {
        console.error('\n💥 ERROR:');
        console.error('  ' + error.message);
        console.error('\n💡 HINT: Check SPECIFICATION.md for correct syntax or ROADMAP.md for known limitations.');
    }
}

// Instantiate and run the CLI
new GlyphCLI().run();
