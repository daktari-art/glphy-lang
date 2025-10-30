// src/runtime/engine.js - FIXED VERSION
export class GlyphEngine {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.output = [];
        this.variables = new Map();
        this.executionHistory = [];
        this.builtinFunctions = this.initializeBuiltins();
    }

    initializeBuiltins() {
        return {
            // Math operations - MULTI-INPUT FIXED
            'multiply': (inputs) => {
                console.log(`🔢 MULTIPLY called with:`, inputs);
                if (inputs.length < 2) {
                    throw new Error(`Multiply needs at least 2 inputs, got ${inputs.length}`);
                }
                const result = inputs.reduce((a, b) => a * b, 1);
                console.log(`🔢 MULTIPLY result: ${inputs.join(' × ')} = ${result}`);
                return result;
            },
            'add': (inputs) => {
                console.log(`➕ ADD called with:`, inputs);
                if (inputs.length < 2) throw new Error('Add needs at least 2 inputs');
                const result = inputs.reduce((a, b) => a + b, 0);
                console.log(`➕ ADD result: ${inputs.join(' + ')} = ${result}`);
                return result;
            },
            'subtract': (inputs) => {
                if (inputs.length < 2) throw new Error('Subtract needs 2 inputs');
                return inputs[0] - inputs[1];
            },
            'divide': (inputs) => {
                if (inputs.length < 2) throw new Error('Divide needs 2 inputs');
                if (inputs[1] === 0) throw new Error('Division by zero');
                return inputs[0] / inputs[1];
            },
            'exponent': (inputs) => {
                if (inputs.length < 2) throw new Error('Exponent needs base and exponent');
                return Math.pow(inputs[0], inputs[1]);
            },

            // Text operations - MULTI-INPUT FIXED
            'to_upper': (inputs) => {
                if (inputs.length < 1) throw new Error('to_upper needs 1 input');
                return String(inputs[0]).toUpperCase();
            },
            'to_lower': (inputs) => {
                if (inputs.length < 1) throw new Error('to_lower needs 1 input');
                return String(inputs[0]).toLowerCase();
            },
            'concat': (inputs) => {
                console.log(`🔗 CONCAT called with:`, inputs);
                if (inputs.length < 2) throw new Error('concat needs at least 2 inputs');
                const result = inputs.map(String).join('');
                console.log(`🔗 CONCAT result: "${inputs.join('" + "')}" = "${result}"`);
                return result;
            },
            'length': (inputs) => {
                if (inputs.length < 1) throw new Error('length needs 1 input');
                return String(inputs[0]).length;
            },

            // Output operations
            'print': (inputs) => {
                if (inputs.length < 1) throw new Error('print needs 1 input');
                const output = `📤 PRINT: ${inputs[0]}`;
                this.output.push(output);
                console.log(output);
                return inputs[0];
            },
             // Text-to-number conversion functions
        'parse_text_to_number': (inputs) => {
            if (inputs.length < 1) throw new Error('parse_text_to_number needs 1 input');
            const text = String(inputs[0]).toLowerCase();
            
            // Simple text-to-number conversion
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
                    // Ignore 'and'
                    continue;
                } else {
                    // Try to parse as direct number
                    const directNum = Number(word);
                    if (!isNaN(directNum)) {
                        current = directNum;
                    }
                }
            }
            
            result = current;
            console.log(`🔤 TEXT_TO_NUMBER: "${text}" → ${result}`);
            return result;
        },

        'clean_mixed_input': (inputs) => {
            if (inputs.length < 1) throw new Error('clean_mixed_input needs 1 input');
            const text = String(inputs[0]);
            
            // Extract numbers from mixed text
            const numbers = text.match(/\d+/g);
            const result = numbers ? Number(numbers[0]) : 0;
            
            console.log(`🧹 CLEAN_INPUT: "${text}" → ${result}`);
            return result;
        },

        'to_number': (inputs) => {
            if (inputs.length < 1) throw new Error('to_number needs 1 input');
            const num = Number(inputs[0]);
            if (isNaN(num)) throw new Error(`Cannot convert "${inputs[0]}" to number`);
            console.log(`🔢 TO_NUMBER: "${inputs[0]}" → ${num}`);
            return num;
        },

        'is_valid_age': (inputs) => {
            if (inputs.length < 1) throw new Error('is_valid_age needs 1 input');
            const age = Number(inputs[0]);
            const isValid = !isNaN(age) && age >= 0 && age <= 120;
            console.log(`✅ VALID_AGE: ${age} → ${isValid}`);
            return isValid;
        },


            // Type conversion
            'to_string': (inputs) => {
                if (inputs.length < 1) throw new Error('to_string needs 1 input');
                return String(inputs[0]);
            },
            'to_number': (inputs) => {
                if (inputs.length < 1) throw new Error('to_number needs 1 input');
                const num = Number(inputs[0]);
                if (isNaN(num)) throw new Error(`Cannot convert "${inputs[0]}" to number`);
                return num;
            }
        };
    }

    loadProgram(ast) {
        this.ast = ast;
        this.nodes.clear();
        this.connections = ast.connections || [];
        this.output = [];
        this.variables.clear();
        this.executionHistory = [];

        // Load all nodes
        ast.nodes.forEach(node => {
            this.nodes.set(node.id, { 
                ...node, 
                executed: false, 
                result: null,
                error: null,
                inputs: this.findInputs(node.id),
                outputs: this.findOutputs(node.id)
            });
        });

        console.log(`🔮 Loaded program: ${this.nodes.size} nodes, ${this.connections.length} connections`);
        
        // DEBUG: Enhanced connection verification
        console.log('🔗 CONNECTION VERIFICATION:');
        this.nodes.forEach((node, id) => {
            console.log(`   ${node.type}("${node.value}"): ${node.inputs.length} inputs, ${node.outputs.length} outputs`);
            if (node.inputs.length > 0) {
                console.log(`     Inputs: ${node.inputs.map(inputId => {
                    const inputNode = this.nodes.get(inputId);
                    return `${inputNode?.type}("${inputNode?.value}")`;
                }).join(', ')}`);
            }
        });
        
        this.buildExecutionOrder();
    }

    findInputs(nodeId) {
        return this.connections
            .filter(conn => conn.to === nodeId)
            .map(conn => conn.from);
    }

    findOutputs(nodeId) {
        return this.connections
            .filter(conn => conn.from === nodeId)
            .map(conn => conn.to);
    }

    buildExecutionOrder() {
        // Kahn's algorithm for topological sort
        const inDegree = new Map();
        const graph = new Map();
        
        // Initialize
        for (const nodeId of this.nodes.keys()) {
            inDegree.set(nodeId, 0);
            graph.set(nodeId, []);
        }
        
        // Build graph and in-degree
        for (const conn of this.connections) {
            graph.get(conn.from).push(conn.to);
            inDegree.set(conn.to, inDegree.get(conn.to) + 1);
        }
        
        // Find nodes with no incoming connections
        const queue = [];
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }
        
        const order = [];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            order.push(nodeId);
            
            for (const neighbor of graph.get(nodeId)) {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }
        
        // Check for cycles
        if (order.length !== this.nodes.size) {
            console.warn('⚠️  Possible cycle detected in graph');
        }
        
        this.executionOrder = order;
        console.log(`📋 Execution order:`, order.map(id => {
            const node = this.nodes.get(id);
            return `${node.type}("${node.value}")`;
        }));
    }

    async execute() {
        console.log('🚀 Starting Glyph program execution...');
        console.log('='.repeat(50));

        const startTime = Date.now();
        
        try {
            for (const nodeId of this.executionOrder) {
                await this.executeNode(nodeId);
            }

            const executionTime = Date.now() - startTime;
            
            console.log('='.repeat(50));
            console.log(`✅ Execution completed in ${executionTime}ms`);
            
            return this.getExecutionResult();
            
        } catch (error) {
            console.log('='.repeat(50));
            console.error(`💥 Execution failed: ${error.message}`);
            
            return {
                success: false,
                error: error.message,
                output: this.output,
                executionTime: Date.now() - startTime,
                nodes: Array.from(this.nodes.values()).map(node => ({
                    id: node.id,
                    type: node.type,
                    value: node.value,
                    result: node.result,
                    error: node.error,
                    executed: node.executed
                }))
            };
        }
    }

    async executeNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node || node.executed) {
            return node?.result;
        }

        // Execute ALL input nodes first and collect ALL their results
        const inputResults = [];
        for (const inputId of node.inputs) {
            const result = await this.executeNode(inputId);
            inputResults.push(result);
        }

        console.log(`▶️ Executing ${node.type}: "${node.value}"`);
        console.log(`   Inputs received: [${inputResults.join(', ')}]`);
        
        try {
            let result;
            
            switch (node.type) {
                case 'DATA_NODE':
                case 'TEXT_NODE':
                case 'BOOL_NODE':
                case 'LIST_NODE':
                    result = node.value;
                    break;
                    
                case 'FUNCTION_NODE':
                    result = await this.executeFunction(node, inputResults);
                    break;
                    
                case 'OUTPUT_NODE':
                    result = this.executeOutput(inputResults[0]);
                    break;
                    
                default:
                    result = node.value;
            }

            node.result = result;
            node.executed = true;
            
            this.executionHistory.push({
                node: nodeId,
                type: node.type,
                value: node.value,
                result: result,
                timestamp: Date.now(),
                status: 'success'
            });
            
            console.log(`✅ ${node.type} result:`, result);
            return result;
            
        } catch (error) {
            node.error = error.message;
            node.executed = true;
            
            this.executionHistory.push({
                node: nodeId,
                type: node.type,
                value: node.value,
                error: error.message,
                timestamp: Date.now(),
                status: 'error'
            });
            
            console.log(`❌ ${node.type} error:`, error.message);
            throw error;
        }
    }

    async executeFunction(node, inputs) {
        const funcName = node.value;
        
        console.log(`🎯 Calling function: ${funcName}`);
        console.log(`   Input values:`, inputs);
        
        if (this.builtinFunctions[funcName]) {
            return this.builtinFunctions[funcName](inputs);
        }
        
        throw new Error(`Unknown function: ${funcName}`);
    }

    executeOutput(input) {
        const output = `📤 OUTPUT: ${input}`;
        this.output.push(output);
        console.log(output);
        return input;
    }

    getExecutionResult() {
        const nodeResults = Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            type: node.type,
            value: node.value,
            result: node.result,
            error: node.error,
            executed: node.executed,
            inputs: node.inputs,
            outputs: node.outputs
        }));

        const success = !nodeResults.some(n => n.error);
        const executedNodes = nodeResults.filter(n => n.executed).length;

        return {
            success,
            output: this.output,
            nodes: nodeResults,
            statistics: {
                totalNodes: this.nodes.size,
                executedNodes: executedNodes,
                successRate: (executedNodes / this.nodes.size) * 100,
                outputCount: this.output.length
            },
            executionHistory: this.executionHistory
        };
    }
}
