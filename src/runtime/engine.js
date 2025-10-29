// src/runtime/engine.js
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
            // Math operations
            'multiply': (inputs) => {
                if (inputs.length < 2) throw new Error('Multiply needs at least 2 inputs');
                return inputs.reduce((a, b) => a * b, 1);
            },
            'add': (inputs) => {
                if (inputs.length < 2) throw new Error('Add needs at least 2 inputs');
                return inputs.reduce((a, b) => a + b, 0);
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
            'modulo': (inputs) => {
                if (inputs.length < 2) throw new Error('Modulo needs 2 inputs');
                return inputs[0] % inputs[1];
            },

            // Text operations
            'to_upper': (inputs) => {
                if (inputs.length < 1) throw new Error('to_upper needs 1 input');
                return String(inputs[0]).toUpperCase();
            },
            'to_lower': (inputs) => {
                if (inputs.length < 1) throw new Error('to_lower needs 1 input');
                return String(inputs[0]).toLowerCase();
            },
            'concat': (inputs) => {
                if (inputs.length < 2) throw new Error('concat needs at least 2 inputs');
                return inputs.map(String).join('');
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
            },

            // Text parsing (for user input scenarios)
            'extract_number': (inputs) => {
                if (inputs.length < 1) throw new Error('extract_number needs 1 input');
                const text = String(inputs[0]);
                const numbers = text.match(/\d+/g);
                return numbers ? parseInt(numbers[0]) : null;
            },
            'parse_text_to_number': (inputs) => {
                if (inputs.length < 1) throw new Error('parse_text_to_number needs 1 input');
                const text = String(inputs[0]).toLowerCase().trim();
                const numberWords = {
                    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
                    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
                    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
                    'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
                    'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40,
                    'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
                };
                
                // Direct match
                if (numberWords[text] !== undefined) return numberWords[text];
                
                // Pattern like "twenty five"
                const words = text.split(/\s+/);
                if (words.length === 2 && numberWords[words[0]] && numberWords[words[1]]) {
                    return numberWords[words[0]] + numberWords[words[1]];
                }
                
                return null;
            },
            'clean_mixed_input': (inputs) => {
                if (inputs.length < 1) throw new Error('clean_mixed_input needs 1 input');
                const text = String(inputs[0]);
                const match = text.match(/(\d+)/);
                return match ? parseInt(match[0]) : null;
            },
            'is_valid_age': (inputs) => {
                if (inputs.length < 1) throw new Error('is_valid_age needs 1 input');
                const age = inputs[0];
                return age !== null && age >= 0 && age <= 120;
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
        const visited = new Set();
        const order = [];
        const nodeDependencies = new Map();

        // Build dependency map
        this.nodes.forEach((node, id) => {
            nodeDependencies.set(id, new Set(node.inputs));
        });

        // Topological sort
        const visit = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const dependencies = nodeDependencies.get(nodeId);
            dependencies.forEach(depId => {
                if (!visited.has(depId)) {
                    visit(depId);
                }
            });

            order.push(nodeId);
        };

        // Start with nodes that have no dependencies
        const startNodes = Array.from(this.nodes.entries())
            .filter(([id, node]) => node.inputs.length === 0)
            .map(([id, node]) => id);

        if (startNodes.length === 0) {
            // If no start nodes, use all nodes
            this.nodes.forEach((node, id) => visit(id));
        } else {
            startNodes.forEach(id => visit(id));
        }

        this.executionOrder = order;
        console.log(`📋 Execution order: ${this.executionOrder.length} nodes`);
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
        if (!node || node.executed) return node?.result;

        // Execute all input nodes first
        const inputPromises = node.inputs.map(inputId => this.executeNode(inputId));
        const inputResults = await Promise.all(inputPromises);

        console.log(`▶️ Executing ${node.type} (${nodeId}): ${node.value}`);
        
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
                    
                case 'ERROR_NODE':
                    result = this.executeError(node, inputResults);
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

    executeError(node, inputs) {
        const errorMessage = inputs[0] || node.value;
        throw new Error(`ERROR_NODE: ${errorMessage}`);
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

    // Utility method for direct function execution
    async executeFunctionByName(funcName, ...args) {
        if (this.builtinFunctions[funcName]) {
            return this.builtinFunctions[funcName](args);
        }
        throw new Error(`Unknown function: ${funcName}`);
    }
}
