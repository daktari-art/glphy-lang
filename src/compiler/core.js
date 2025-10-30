// src/compiler/core.js - COMPLETE UPDATED VERSION
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
        
        jsCode += `// Built-in functions\n`;
        jsCode += `const glyphBuiltins = {\n`;
        
        // Include all built-in functions in the compiled output
        const builtinFunctions = [
            'multiply', 'add', 'subtract', 'divide', 'exponent',
            'to_upper', 'to_lower', 'concat', 'length', 
            'print', 'to_string', 'to_number',
            'parse_text_to_number', 'clean_mixed_input', 'is_valid_age'
        ];
        
        builtinFunctions.forEach((funcName, index) => {
            jsCode += `  '${funcName}': ${this.generateBuiltinJS(funcName)}`;
            if (index < builtinFunctions.length - 1) jsCode += ',';
            jsCode += '\n';
        });
        
        jsCode += `};\n\n`;
        
        jsCode += `// Glyph Program\n`;
        jsCode += `const glyphProgram = {\n`;
        jsCode += `  metadata: ${JSON.stringify(ast.metadata)},\n`;
        jsCode += `  nodes: {\n`;
        
        ast.nodes.forEach((node, index) => {
            jsCode += `    "${node.id}": ${this.generateNodeJS(node)}`;
            if (index < ast.nodes.length - 1) jsCode += ',';
            jsCode += '\n';
        });
        
        jsCode += `  },\n`;
        jsCode += `  connections: ${JSON.stringify(ast.connections, null, 2)},\n`;
        jsCode += `  labels: ${JSON.stringify(ast.labels, null, 2)}\n`;
        jsCode += `};\n\n`;
        
        jsCode += `// Execution function\n`;
        jsCode += `async function executeGlyphProgram() {\n`;
        jsCode += `  const nodes = glyphProgram.nodes;\n`;
        jsCode += `  const connections = glyphProgram.connections;\n`;
        jsCode += `  const output = [];\n\n`;
        jsCode += `  // Build execution order (simplified)\n`;
        jsCode += `  const executionOrder = Object.keys(nodes).filter(id => \n`;
        jsCode += `    !connections.some(conn => conn.to === id)\n`;
        jsCode += `  );\n\n`;
        jsCode += `  console.log('🚀 Executing compiled Glyph program...');\n`;
        jsCode += `  \n`;
        jsCode += `  for (const nodeId of executionOrder) {\n`;
        jsCode += `    const node = nodes[nodeId];\n`;
        jsCode += `    if (node.execute) {\n`;
        jsCode += `      const result = await node.execute();\n`;
        jsCode += `      console.log('✅', nodeId, 'result:', result);\n`;
        jsCode += `    }\n`;
        jsCode += `  }\n`;
        jsCode += `  \n`;
        jsCode += `  return { output, success: true };\n`;
        jsCode += `}\n\n`;
        jsCode += `export default glyphProgram;\n`;
        jsCode += `export { executeGlyphProgram, glyphBuiltins };\n`;
        
        return jsCode;
    }

    generateBuiltinJS(funcName) {
        const functionImplementations = {
            'multiply': `(inputs) => inputs.reduce((a, b) => a * b, 1)`,
            'add': `(inputs) => inputs.reduce((a, b) => a + b, 0)`,
            'subtract': `(inputs) => inputs[0] - inputs[1]`,
            'divide': `(inputs) => inputs[0] / inputs[1]`,
            'exponent': `(inputs) => Math.pow(inputs[0], inputs[1])`,
            'to_upper': `(inputs) => String(inputs[0]).toUpperCase()`,
            'to_lower': `(inputs) => String(inputs[0]).toLowerCase()`,
            'concat': `(inputs) => inputs.map(String).join('')`,
            'length': `(inputs) => String(inputs[0]).length`,
            'print': `(inputs) => { 
                const output = '📤 PRINT: ' + inputs[0];
                console.log(output);
                return inputs[0];
            }`,
            'to_string': `(inputs) => String(inputs[0])`,
            'to_number': `(inputs) => Number(inputs[0])`,
            'parse_text_to_number': `(inputs) => {
                const text = String(inputs[0]).toLowerCase();
                const numberWords = {
                    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 
                    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
                    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 
                    'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
                    'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
                    'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
                    'eighty': 80, 'ninety': 90, 'hundred': 100
                };
                let result = 0;
                let current = 0;
                const words = text.split(' ');
                for (const word of words) {
                    if (numberWords[word] !== undefined) {
                        const num = numberWords[word];
                        if (num === 100) {
                            current *= num;
                        } else {
                            current += num;
                        }
                    } else if (word === 'and') {
                        continue;
                    } else {
                        const directNum = Number(word);
                        if (!isNaN(directNum)) {
                            current = directNum;
                        }
                    }
                }
                result = current;
                console.log('🔤 TEXT_TO_NUMBER: \"' + text + '\" → ' + result);
                return result;
            }`,
            'clean_mixed_input': `(inputs) => {
                const text = String(inputs[0]);
                const numbers = text.match(/\\d+/g);
                const result = numbers ? Number(numbers[0]) : 0;
                console.log('🧹 CLEAN_INPUT: \"' + text + '\" → ' + result);
                return result;
            }`,
            'is_valid_age': `(inputs) => {
                const age = Number(inputs[0]);
                const isValid = !isNaN(age) && age >= 0 && age <= 120;
                console.log('✅ VALID_AGE: ' + age + ' → ' + isValid);
                return isValid;
            }`
        };

        return functionImplementations[funcName] || `(inputs) => { throw new Error('Unknown function: ${funcName}'); }`;
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
            case 'BOOL_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: () => ${node.value} }`;
            case 'LIST_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: () => ${JSON.stringify(node.value)} }`;
            case 'OUTPUT_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: (value) => { console.log("📤 OUTPUT:", value); return value; } }`;
            case 'FUNCTION_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: (...inputs) => glyphBuiltins.${node.value}(inputs) }`;
            case 'CONDITION_NODE':
                return `{ ...${JSON.stringify(baseNode)}, execute: (condition) => { 
                    console.log("🔀 CONDITION:", ${JSON.stringify(node.value)}, "=", condition);
                    return condition;
                } }`;
            default:
                return `{ ...${JSON.stringify(baseNode)}, execute: () => ${JSON.stringify(node.value)} }`;
        }
    }

    validate(ast) {
        const errors = [];
        
        // Check for undefined function calls
        ast.nodes.forEach(node => {
            if (node.type === 'FUNCTION_NODE') {
                const validFunctions = [
                    'multiply', 'add', 'subtract', 'divide', 'print', 
                    'to_upper', 'to_lower', 'concat', 'length', 'exponent',
                    'to_string', 'to_number', 'parse_text_to_number', 
                    'clean_mixed_input', 'is_valid_age'
                ];
                if (!validFunctions.includes(node.value)) {
                    errors.push(`Undefined function: ${node.value} at line ${node.line}`);
                }
            }
        });

        // Check connection validity
        ast.connections.forEach(conn => {
            const fromNode = ast.nodes.find(n => n.id === conn.from);
            const toNode = ast.nodes.find(n => n.id === conn.to);
            
            if (!fromNode) {
                errors.push(`Connection from undefined node: ${conn.from}`);
            }
            if (!toNode) {
                errors.push(`Connection to undefined node: ${conn.to}`);
            }
            
            // Additional validation: check if connections make sense
            if (fromNode && toNode) {
                // Data nodes shouldn't have inputs (they are sources)
                if (['DATA_NODE', 'TEXT_NODE', 'BOOL_NODE'].includes(fromNode.type) && 
                    ast.connections.some(c => c.to === fromNode.id)) {
                    errors.push(`Data node ${fromNode.id}("${fromNode.value}") should not have incoming connections`);
                }
                
                // Functions should have inputs
                if (toNode.type === 'FUNCTION_NODE') {
                    const inputCount = ast.connections.filter(c => c.to === toNode.id).length;
                    if (inputCount === 0) {
                        errors.push(`Function node ${toNode.id}("${toNode.value}") has no inputs`);
                    }
                }
            }
        });

        // Check for unconnected nodes
        const connectedNodes = new Set();
        ast.connections.forEach(conn => {
            connectedNodes.add(conn.from);
            connectedNodes.add(conn.to);
        });
        
        const unconnectedNodes = ast.nodes.filter(node => !connectedNodes.has(node.id));
        if (unconnectedNodes.length > 0) {
            errors.push(`Unconnected nodes: ${unconnectedNodes.map(n => `${n.type}("${n.value}")`).join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: unconnectedNodes.length > 0 ? ['Some nodes are not connected to the graph'] : []
        };
    }

    // New method: Generate visual representation of the AST
    generateVisualAST(ast) {
        let visual = '📊 VISUAL AST REPRESENTATION\n';
        visual += '='.repeat(50) + '\n';
        
        // Group nodes by line
        const nodesByLine = {};
        ast.nodes.forEach(node => {
            if (!nodesByLine[node.line]) {
                nodesByLine[node.line] = [];
            }
            nodesByLine[node.line].push(node);
        });

        // Generate visual for each line
        Object.keys(nodesByLine).sort().forEach(lineNum => {
            const lineNodes = nodesByLine[lineNum];
            visual += `Line ${lineNum}: `;
            
            lineNodes.forEach((node, index) => {
                visual += `[${node.glyph} ${node.value}]`;
                if (index < lineNodes.length - 1) {
                    // Find connection between consecutive nodes
                    const connection = ast.connections.find(conn => 
                        conn.from === node.id && conn.to === lineNodes[index + 1].id
                    );
                    if (connection) {
                        visual += ` ${connection.glyph} `;
                    } else {
                        visual += ' → '; // Default connection
                    }
                }
            });
            visual += '\n';
        });

        visual += '='.repeat(50) + '\n';
        visual += `Total: ${ast.nodes.length} nodes, ${ast.connections.length} connections\n`;
        
        return visual;
    }

    // New method: Optimize AST by removing redundant nodes
    optimizeAST(ast) {
        console.log('🔧 Optimizing AST...');
        const optimizedNodes = [];
        const optimizedConnections = [];
        
        // Remove duplicate nodes (same type and value on same line)
        const nodeMap = new Map();
        ast.nodes.forEach(node => {
            const key = `${node.type}:${node.value}:${node.line}`;
            if (!nodeMap.has(key)) {
                nodeMap.set(key, node);
                optimizedNodes.push(node);
            } else {
                console.log(`🔄 Removing duplicate node: ${node.type}("${node.value}") on line ${node.line}`);
                // Update connections to point to the kept node
                ast.connections.forEach(conn => {
                    if (conn.from === node.id) {
                        optimizedConnections.push({
                            ...conn,
                            from: nodeMap.get(key).id
                        });
                    } else if (conn.to === node.id) {
                        optimizedConnections.push({
                            ...conn,
                            to: nodeMap.get(key).id
                        });
                    } else {
                        optimizedConnections.push(conn);
                    }
                });
            }
        });

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

        const optimizedAST = {
            ...ast,
            nodes: optimizedNodes.length > 0 ? optimizedNodes : ast.nodes,
            connections: finalConnections.length > 0 ? finalConnections : ast.connections
        };

        console.log(`✅ Optimization complete: ${ast.nodes.length - optimizedAST.nodes.length} nodes removed, ${ast.connections.length - optimizedAST.connections.length} connections removed`);
        
        return optimizedAST;
    }
}
