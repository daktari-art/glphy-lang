// src/compiler/core.js
import { GraphParser } from './graph-parser.js';

export class GlyphCompiler {
    constructor() {
        this.parser = new GraphParser();
        this.nodeTypes = {
            'DATA_NODE': '○',
            'TEXT_NODE': '□', 
            'LIST_NODE': '△',
            'BOOL_NODE': '◇',
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
        return ast;
    }

    compileToJS(ast) {
        let jsCode = `// Glyph Language - Generated JavaScript\n`;
        jsCode += `// AST: ${ast.nodes.length} nodes, ${ast.connections.length} connections\n\n`;
        
        jsCode += `const glyphProgram = {\n`;
        jsCode += `  metadata: ${JSON.stringify(ast.metadata)},\n`;
        jsCode += `  nodes: {\n`;
        
        ast.nodes.forEach(node => {
            jsCode += `    "${node.id}": ${this.generateNodeJS(node)},\n`;
        });
        
        jsCode += `  },\n`;
        jsCode += `  connections: ${JSON.stringify(ast.connections, null, 2)},\n`;
        jsCode += `  labels: ${JSON.stringify(ast.labels, null, 2)}\n`;
        jsCode += `};\n\n`;
        jsCode += `export default glyphProgram;\n`;
        
        return jsCode;
    }

    generateNodeJS(node) {
        const baseNode = {
            id: node.id,
            type: node.type,
            glyph: node.glyph,
            value: node.value,
            label: node.label,
            line: node.line
        };

        switch(node.type) {
            case 'DATA_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: () => ${JSON.stringify(node.value)} }`;
            case 'TEXT_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: () => "${node.value}" }`;
            case 'OUTPUT_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: (value) => { console.log("📤 OUTPUT:", value); return value; } }`;
            case 'FUNCTION_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: (...inputs) => glyphRuntime.executeFunction("${node.value}", inputs) }`;
            default:
                return `{ ...${JSON.stringify(baseNode)}, execute: () => ${JSON.stringify(node.value)} }`;
        }
    }

    validate(ast) {
        const errors = [];
        
        // Check for undefined function calls
        ast.nodes.forEach(node => {
            if (node.type === 'FUNCTION_NODE') {
                const validFunctions = ['multiply', 'add', 'subtract', 'divide', 'print', 'to_upper', 'to_lower', 'concat'];
                if (!validFunctions.includes(node.value)) {
                    errors.push(`Undefined function: ${node.value} at line ${node.line}`);
                }
            }
        });

        // Check connection validity
        ast.connections.forEach(conn => {
            const fromNode = ast.nodes.find(n => n.id === conn.from);
            const toNode = ast.nodes.find(n => n.id === conn.to);
            
            if (!fromNode) errors.push(`Connection from undefined node: ${conn.from}`);
            if (!toNode) errors.push(`Connection to undefined node: ${conn.to}`);
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}
