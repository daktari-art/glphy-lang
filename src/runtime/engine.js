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
        
        // DEBUG: Log all connections to verify multi-input detection
        console.log('🔗 CONNECTION MAP:');
        this.connections.forEach(conn => {
            const fromNode = this.nodes.get(conn.from);
            const toNode = this.nodes.get(conn.to);
            if (fromNode && toNode) {
                console.log(`   ${fromNode.type}(${fromNode.value}) → ${toNode.type}(${toNode.value})`);
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
            return `${node.type}(${node.value})`;
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
        const inputPromises = node.inputs.map(inputId => this.executeNode(inputId));
        const inputResults = await Promise.all(inputPromises);

        console.log(`▶️ Executing ${node.type}: ${node.value}`);
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
