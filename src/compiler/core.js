// src/compiler/core.js - COMPLETE UPDATED VERSION (v0.3.0)
import { GraphParser } from './graph-parser.js';

export class GlyphCompiler {
    constructor() {
        this.parser = new GraphParser();
        this.nodeTypes = {
            'DATA_NODE': '○',
            'TEXT_NODE': '□', 
            'LIST_NODE': '△',
            'BOOL_NODE': '◇', // NEW: Added BOOL_NODE
            'FUNCTION_NODE': '▷',
            'LOOP_NODE': '⟳',
            'CONDITION_NODE': '◯',
            'OUTPUT_NODE': '⤶',
            'ERROR_NODE': '⚡',
            'ASYNC_NODE': '🔄'
        };
    }

    parse(glyphCode) {
        console.log('🔮 Parsing Glyph code...');
        const ast = this.parser.parse(glyphCode);
        console.log(`✅ Parsed ${ast.nodes.length} nodes and ${ast.connections.length} connections`);
        
        // v0.3.0 FEATURE STUBS
        console.log('🛡️ Running Type Inference...');
        const typedAST = this.runTypeInference(ast); 
        console.log('✅ Type Checking passed (Structural Stub)');
        
        return typedAST;
    }

    runTypeInference(ast) {
        // NOTE: In a full v0.3.0 implementation, this would iterate over the AST,
        // infer missing types, and validate connected data types (e.g., number -> multiply).
        // For now, it simply validates the presence of annotated types.
        
        // Placeholder logic: Check if all annotated data types are valid.
        ast.nodes.forEach(node => {
            if (node.dataType && !['number', 'string', 'boolean', 'list'].includes(node.dataType)) {
                throw new Error(`Type Error: Unknown type annotation '${node.dataType}' on line ${node.lineNumber}`);
            }
        });

        // The AST is returned unmodified for now, awaiting full implementation.
        return ast;
    }

    compileToJS(ast) {
        let jsCode = `// Glyph Language - Generated JavaScript\n`;
        jsCode += `// AST: ${ast.nodes.length} nodes, ${ast.connections.length} connections\n\n`;
        
        jsCode += `// Built-in functions\n`;
        jsCode += `const glyphBuiltins = {\n`;
        
        // Include all built-in functions in the compiled output
        const builtinFunctions = [
            'multiply', 'add', 'subtract', 'divide', 
            'concat', 'to_upper', 'to_lower', 'trim', 'length',
            'to_number', 'to_string', 'to_boolean'
        ];

        // Placeholder for emitting JS code for builtins (e.g., from engine.js)
        jsCode += `    // ... Function definitions from engine.js ...\n`;
        jsCode += `};\n\n`;

        // Execution Logic Placeholder
        jsCode += `function executeGlyphProgram(ast) {\n`;
        jsCode += `    // NOTE: Full JS compilation is a v0.4.0 target.\n`;
        jsCode += `    // Current compilation is a structural stub.\n`;
        jsCode += `    console.log("Program compiled and started.");\n`;
        
        // This is where node execution would be mapped to JS functions
        jsCode += `    // Example: const node_multiply_result = glyphBuiltins.multiply([42, 10]);\n`;
        
        jsCode += `}\n\n`;
        jsCode += `// Program Entry Point\n`;
        jsCode += `// executeGlyphProgram(${JSON.stringify(ast, null, 4)}); \n`;
        jsCode += `// NOTE: AST JSON removed for brevity and file size. Real compilation uses AST data.\n`;
        
        return jsCode;
    }

    // AST Optimization (Still present, but simplified)
    optimizeAST(ast) {
        // Optimization is still necessary after parsing/type checking
        
        const nodeMap = new Map();
        const optimizedNodes = [];
        
        // 1. Merge duplicate constant nodes (e.g., multiple [○ 42])
        ast.nodes.forEach(node => {
            if (node.type === 'DATA_NODE' || node.type === 'TEXT_NODE' || node.type === 'BOOL_NODE' || node.type === 'LIST_NODE') {
                const key = `${node.type}:${node.value}`;
                if (!nodeMap.has(key)) {
                    nodeMap.set(key, node);
                    optimizedNodes.push(node);
                }
            } else {
                optimizedNodes.push(node);
            }
        });

        // 2. Remap connections to the merged nodes
        let optimizedConnections = [];
        ast.nodes.forEach(node => {
            const key = `${node.type}:${node.value}`;
            
            if (nodeMap.has(key) && nodeMap.get(key).id !== node.id) {
                // This node was merged; remap its connections to the kept node
                ast.connections.forEach(conn => {
                    let from = conn.from === node.id ? nodeMap.get(key).id : conn.from;
                    let to = conn.to === node.id ? nodeMap.get(key).id : conn.to;
                    optimizedConnections.push({...conn, from, to});
                });
            } else if (node.type !== 'DATA_NODE' && node.type !== 'TEXT_NODE' && node.type !== 'BOOL_NODE' && node.type !== 'LIST_NODE') {
                // Keep non-data node connections
                 ast.connections.filter(conn => conn.from === node.id || conn.to === node.id).forEach(conn => optimizedConnections.push(conn));
            }
        });
        
        // Filter out connections for nodes that were merged but keep the connections to the original node if it was the kept one
        optimizedConnections = optimizedConnections.filter(conn => 
            optimizedNodes.some(n => n.id === conn.from) && 
            optimizedNodes.some(n => n.id === conn.to)
        );

        // Remove duplicate connections
        const connectionSet = new Set();
        const finalConnections = optimizedConnections.filter(conn => {
            const key = `${conn.from}->${conn.to}`;
            if (!connectionSet.has(key)) {
                connectionSet.add(key);
                return true;
            }
            return false;
        });
        
        // Final filter to ensure no connections remain that point to removed nodes
        const finalNodes = new Set(optimizedNodes.map(n => n.id));
        const cleanConnections = finalConnections.filter(conn => finalNodes.has(conn.from) && finalNodes.has(conn.to));

        const optimizedAST = {
            ...ast,
            nodes: optimizedNodes,
            connections: cleanConnections
        };

        console.log(`✅ Optimization complete: ${ast.nodes.length - optimizedAST.nodes.length} nodes removed`);
        
        return optimizedAST;
    }
}
