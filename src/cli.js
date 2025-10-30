#!/usr/bin/env node
// src/cli.js - FIXED VERSION
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
                    await this.startREPL();
                    break;
                case 'test':
                    await this.runTests();
                    break;
                default:
                    // If no command specified, assume run
                    await this.executeFile(command);
            }

        } catch (error) {
            this.handleError(error);
        }
    }

    async executeFile(filename) {
        const filepath = this.resolveFilePath(filename);
        const source = this.readGlyphFile(filepath);

        console.log('🔮 Glyph Language - Executing:', filename);
        console.log('='.repeat(60));

        const ast = this.compiler.parse(source);
        
        // Validate before execution
        const validation = this.compiler.validate(ast);
        if (!validation.valid) {
            console.error('❌ Validation errors:');
            validation.errors.forEach(err => console.error('   -', err));
            throw new Error('Program validation failed');
        }

        this.engine.loadProgram(ast);
        const result = await this.engine.execute();
        
        this.showExecutionResult(result, filename);
    }

    async parseFile(filename) {
        const filepath = this.resolveFilePath(filename);
        const source = this.readGlyphFile(filepath);

        console.log('📄 Parsing Glyph file:', filename);
        console.log('='.repeat(40));

        const ast = this.compiler.parse(source);
        
        console.log('📊 ABSTRACT SYNTAX TREE:');
        console.log(JSON.stringify(ast, null, 2));
        
        console.log('\n📋 PROGRAM SUMMARY:');
        console.log(`   Nodes: ${ast.nodes.length}`);
        console.log(`   Connections: ${ast.connections.length}`);
        console.log(`   Labels: ${Object.keys(ast.labels).length}`);
        
        const validation = this.compiler.validate(ast);
        console.log(`   Validation: ${validation.valid ? '✅ PASS' : '❌ FAIL'}`);
        if (!validation.valid) {
            console.log('   Errors:', validation.errors);
        }
    }

    async compileFile(filename) {
        const filepath = this.resolveFilePath(filename);
        const source = this.readGlyphFile(filepath);

        console.log('⚡ Compiling Glyph file:', filename);

        const ast = this.compiler.parse(source);
        const jsCode = this.compiler.compileToJS(ast);
        
        const outputFile = filepath.replace('.glyph', '.js');
        writeFileSync(outputFile, jsCode);
        
        console.log(`✅ Compiled to: ${outputFile}`);
        console.log(`📦 ${jsCode.split('\n').length} lines of JavaScript generated`);
    }

    async startREPL() {
        console.log('🔮 Glyph Language REPL');
        console.log('Type "exit" or "quit" to leave');
        console.log('Type "help" for available commands');
        console.log('='.repeat(40));

        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'glyph> '
        });

        readline.prompt();

        readline.on('line', async (line) => {
            const input = line.trim();
            
            if (input === 'exit' || input === 'quit') {
                readline.close();
                return;
            }

            if (input === 'help') {
                this.showREPLHelp();
                readline.prompt();
                return;
            }

            if (input === 'clear') {
                console.clear();
                readline.prompt();
                return;
            }

            if (input === 'env') {
                this.showEnvironment();
                readline.prompt();
                return;
            }

            try {
                if (input) {
                    // Execute single line of Glyph code
                    const ast = this.compiler.parse(input);
                    this.engine.loadProgram(ast);
                    const result = await this.engine.execute();
                    
                    if (result.output.length > 0) {
                        result.output.forEach(line => console.log(line));
                    }
                    
                    if (result.nodes.length === 1 && result.nodes[0].result !== undefined) {
                        console.log('=>', result.nodes[0].result);
                    }
                }
            } catch (error) {
                console.error('💥', error.message);
            }

            readline.prompt();
        });

        readline.on('close', () => {
            console.log('👋 Goodbye!');
            process.exit(0);
        });
    }

    async runTests() {
        console.log('🧪 Running Glyph Language Tests');
        console.log('='.repeat(40));

        const testFiles = [
            'examples/hello-world.glyph',
            'examples/arithmetic.glyph',
            'examples/user-input.glyph'
        ].filter(file => existsSync(resolve(process.cwd(), file)));

        if (testFiles.length === 0) {
            console.log('⚠️  No test files found in examples/ directory');
            return;
        }

        let passed = 0;
        let failed = 0;

        for (const testFile of testFiles) {
            try {
                console.log(`\n📁 Testing: ${testFile}`);
                const filepath = this.resolveFilePath(testFile);
                const source = this.readGlyphFile(filepath);
                
                const ast = this.compiler.parse(source);
                this.engine.loadProgram(ast);
                const result = await this.engine.execute();
                
                if (result.success) {
                    console.log('✅ PASS');
                    passed++;
                } else {
                    console.log('❌ FAIL');
                    failed++;
                }
                
            } catch (error) {
                console.log('❌ FAIL -', error.message);
                failed++;
            }
        }

        console.log('\n' + '='.repeat(40));
        console.log(`📊 RESULTS: ${passed} passed, ${failed} failed, ${testFiles.length} total`);
        
        if (failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            process.exit(1);
        }
    }

    resolveFilePath(filename) {
        const filepath = resolve(process.cwd(), filename);
        
        if (!existsSync(filepath)) {
            throw new Error(`File not found: ${filename}`);
        }
        
        if (!filepath.endsWith('.glyph')) {
            throw new Error(`File must have .glyph extension: ${filename}`);
        }
        
        return filepath;
    }

    readGlyphFile(filepath) {
        try {
            return readFileSync(filepath, 'utf8');
        } catch (error) {
            throw new Error(`Cannot read file: ${filepath}`);
        }
    }

    showExecutionResult(result, filename) {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 EXECUTION COMPLETE');
        console.log('='.repeat(60));
        
        if (result.success) {
            console.log('✅ SUCCESS: Program executed without errors');
        } else {
            console.log('❌ FAILED: Program encountered errors');
        }
        
        console.log(`\n📊 STATISTICS:`);
        console.log(`   File: ${filename}`);
        console.log(`   Nodes: ${result.statistics.totalNodes}`);
        console.log(`   Executed: ${result.statistics.executedNodes}`);
        console.log(`   Success Rate: ${result.statistics.successRate.toFixed(1)}%`);
        console.log(`   Outputs: ${result.statistics.outputCount}`);
        
        if (result.output && result.output.length > 0) {
            console.log(`\n📤 OUTPUT:`);
            result.output.forEach(line => console.log('   ' + line));
        }
        
        const nodesWithResults = result.nodes.filter(n => n.executed && n.result !== undefined);
        if (nodesWithResults.length > 0) {
            console.log(`\n💾 RESULTS:`);
            nodesWithResults.forEach(node => {
                console.log(`   ${node.id}: ${node.result}`);
            });
        }
        
        const errorNodes = result.nodes.filter(n => n.error);
        if (errorNodes.length > 0) {
            console.log(`\n❌ ERRORS:`);
            errorNodes.forEach(node => {
                console.log(`   ${node.id}: ${node.error}`);
            });
        }
    }

    showREPLHelp() {
        console.log(`
🔮 GLYPH REPL COMMANDS:

  [○ value] → [▷ function] ← [○ value]  Execute Glyph code
  exit, quit                            Exit REPL
  help                                  Show this help
  clear                                 Clear screen
  env                                   Show environment

EXAMPLES:
  [○ 5] → [▷ multiply] ← [○ 6] → [▷ print]
  [□ "hello"] → [▷ to_upper] → [▷ print]
        `);
    }

    showEnvironment() {
        console.log('🔧 RUNTIME ENVIRONMENT:');
        console.log('   Engine: Graph-based with multi-input support');
        console.log('   Parser: GraphParser with connection mapping');
        console.log('   Status: Ready for execution');
    }

    showHelp() {
        console.log(`
🔮 GLYPH LANGUAGE - VISUAL DATA FLOW PROGRAMMING

USAGE:
  glyph run <file.glyph>        Execute a Glyph program
  glyph parse <file.glyph>      Parse and display AST
  glyph compile <file.glyph>    Compile to JavaScript
  glyph repl                    Start interactive REPL
  glyph test                    Run test suite

EXAMPLES:
  glyph run examples/hello-world.glyph
  glyph parse examples/arithmetic.glyph
  glyph compile examples/user-input.glyph
  glyph repl

OPTIONS:
  -h, --help      Show this help message
  -v, --version   Show version information

QUICK START:
  1. Create a .glyph file: echo '[○ 5] → [▷ multiply] ← [○ 6] → [▷ print]' > test.glyph
  2. Run it: glyph run test.glyph
  3. See the magic happen! 🎉

GITHUB: https://github.com/daktari-art/glyph-lang
        `);
    }

    showVersion() {
        const pkgPath = resolve(__dirname, '../package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        console.log(`🔮 Glyph Language v${pkg.version}`);
        console.log('Visual Data Flow Programming Language');
        console.log(`Node.js ${process.version}`);
    }

    handleError(error) {
        console.error('\n💥 ERROR:');
        console.error('  ' + error.message);
        console.error('\n💡 TIP: Use "glyph --help" for usage information');
        process.exit(1);
    }
}

// Execute CLI
new GlyphCLI().run();
