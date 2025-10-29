export class GlyphEngine {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.output = [];
    }

    loadProgram(ast) {
        this.ast = ast;
        this.nodes.clear();
        this.connections = ast.connections || [];
        this.output = [];

        ast.nodes.forEach(node => {
            this.nodes.set(node.id, { ...node, executed: false, result: null });
        });
    }

    async execute() {
        console.log('🚀 Executing Glyph program: main');
        
        // Build execution order based on connections
        const executionOrder = this.buildExecutionOrder();
        
        for (const nodeId of executionOrder) {
            const node = this.nodes.get(nodeId);
            if (node && !node.executed) {
                await this.executeNode(node);
            }
        }

        return this.getExecutionResult();
    }

    buildExecutionOrder() {
        // Simple topological sort - execute sources first
        const nodeIds = Array.from(this.nodes.keys());
        const hasIncoming = new Set();
        
        this.connections.forEach(conn => {
            hasIncoming.add(conn.to);
        });

        // Start with nodes that have no incoming connections
        const executionOrder = nodeIds.filter(id => !hasIncoming.has(id));
        
        // Then add remaining nodes
        nodeIds.forEach(id => {
            if (!executionOrder.includes(id)) {
                executionOrder.push(id);
            }
        });

        return executionOrder;
    }

    async executeNode(node) {
        if (node.executed) return node.result;

        console.log(`▶️ Executing ${node.type}: ${node.value}`);
        
        try {
            let result;
            
            switch (node.type) {
                case 'DATA_NODE':
                case 'TEXT_NODE':
                case 'BOOL_NODE':
                    result = node.value;
                    break;
                    
                case 'FUNCTION_NODE':
                    result = await this.executeFunction(node);
                    break;
                    
                case 'OUTPUT_NODE':
                    const input = await this.getNodeInput(node);
                    result = this.executeOutput(input);
                    break;
                    
                default:
                    result = node.value;
            }

            node.result = result;
            node.executed = true;
            console.log(`✅ ${node.type} result:`, result);
            return result;
            
        } catch (error) {
            console.log(`❌ ${node.type} error:`, error.message);
            node.error = error;
            return null;
        }
    }

    async executeFunction(node) {
        const funcName = node.value;
        
        // Get inputs from connected nodes
        const inputs = [];
        const incomingConnections = this.connections.filter(conn => conn.to === node.id);
        
        for (const conn of incomingConnections) {
            const sourceNode = this.nodes.get(conn.from);
            if (sourceNode) {
                const value = await this.executeNode(sourceNode);
                inputs.push(value);
            }
        }

        const builtins = {
            // Math functions (expect 2 inputs)
            'multiply': (a, b) => a * b,
            'add': (a, b) => a + b,
            'subtract': (a, b) => a - b,
            'divide': (a, b) => a / b,
            
            // Text functions (expect 1 input)
            'to_upper': (str) => str.toUpperCase(),
            'to_lower': (str) => str.toLowerCase(),
            'length': (str) => str.length,
            
            // Output function
            'print': (val) => {
                const output = `📤 PRINT: ${val}`;
                this.output.push(output);
                console.log(output);
                return val;
            }
        };

        if (builtins[funcName]) {
            // Handle functions based on their expected inputs
            if (['multiply', 'add', 'subtract', 'divide'].includes(funcName)) {
                if (inputs.length >= 2) {
                    return builtins[funcName](inputs[0], inputs[1]);
                } else {
                    throw new Error(`Function ${funcName} requires 2 inputs, got ${inputs.length}`);
                }
            } else {
                // Single input functions
                if (inputs.length >= 1) {
                    return builtins[funcName](inputs[0]);
                } else {
                    return builtins[funcName](node.value);
                }
            }
        }

        throw new Error(`Unknown function: ${funcName}`);
    }

    async getNodeInput(node) {
        // Find the first incoming connection
        const incoming = this.connections.filter(conn => conn.to === node.id);
        if (incoming.length === 0) return node.value;

        const sourceNode = this.nodes.get(incoming[0].from);
        return sourceNode ? await this.executeNode(sourceNode) : node.value;
    }

    executeOutput(input) {
        const output = `📤 PRINT: ${input}`;
        this.output.push(output);
        console.log(output);
        return input;
    }

    getExecutionResult() {
        const nodeResults = Array.from(this.nodes.values()).map(node => ({
            type: node.type,
            value: node.value,
            result: node.result,
            error: node.error
        }));

        return {
            success: !nodeResults.some(n => n.error),
            output: this.output,
            nodes: nodeResults
        };
    }
}
