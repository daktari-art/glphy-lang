// Glyph Language Runtime Engine - FIXED VERSION
export class GlyphEngine {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.output = [];
        this.executionOrder = [];
    }

    loadProgram(ast) {
        this.ast = ast;
        this.nodes.clear();
        this.connections = ast.connections || [];
        this.output = [];
        this.executionOrder = [];

        // Load all nodes
        ast.nodes.forEach(node => {
            this.nodes.set(node.id, { 
                ...node, 
                executed: false, 
                result: null,
                inputs: [],
                outputs: []
            });
        });

        // Build node connections
        this.buildNodeConnections();
        // Determine execution order
        this.buildExecutionOrder();
    }

    buildNodeConnections() {
        // Clear existing connections
        for (let node of this.nodes.values()) {
            node.inputs = [];
            node.outputs = [];
        }

        // Build connection maps
        this.connections.forEach(conn => {
            const fromNode = this.nodes.get(conn.from);
            const toNode = this.nodes.get(conn.to);
            
            if (fromNode && toNode) {
                fromNode.outputs.push(conn.to);
                toNode.inputs.push(conn.from);
            }
        });
    }

    buildExecutionOrder() {
        const visited = new Set();
        const order = [];
        
        const visit = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            
            const node = this.nodes.get(nodeId);
            if (node) {
                // Visit all inputs first
                node.inputs.forEach(inputId => visit(inputId));
                order.push(nodeId);
            }
        };

        // Start with nodes that have no outputs (sinks)
        const sinkNodes = Array.from(this.nodes.values())
            .filter(node => node.outputs.length === 0)
            .map(node => node.id);

        // If no sinks, use all nodes
        const startNodes = sinkNodes.length > 0 ? sinkNodes : Array.from(this.nodes.keys());
        
        startNodes.forEach(nodeId => visit(nodeId));
        this.executionOrder = order.reverse();
    }

    async execute() {
        console.log('🚀 Executing Glyph program: main');
        
        for (const nodeId of this.executionOrder) {
            const node = this.nodes.get(nodeId);
            if (node && !node.executed) {
                await this.executeNode(node);
            }
        }

        return this.getExecutionResult();
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
        
        // Get ALL input values
        const inputValues = [];
        for (const inputId of node.inputs) {
            const inputNode = this.nodes.get(inputId);
            if (inputNode) {
                const value = await this.executeNode(inputNode);
                inputValues.push(value);
            }
        }

        const builtins = {
            // Math functions
            'multiply': (inputs) => {
                if (inputs.length < 2) throw new Error('Multiply needs 2 inputs');
                return inputs[0] * inputs[1];
            },
            'add': (inputs) => {
                if (inputs.length < 2) throw new Error('Add needs 2 inputs');
                return inputs[0] + inputs[1];
            },
            'subtract': (inputs) => {
                if (inputs.length < 2) throw new Error('Subtract needs 2 inputs');
                return inputs[0] - inputs[1];
            },
            'divide': (inputs) => {
                if (inputs.length < 2) throw new Error('Divide needs 2 inputs');
                return inputs[0] / inputs[1];
            },
            
            // Text functions
            'to_upper': (inputs) => {
                if (inputs.length < 1) throw new Error('to_upper needs 1 input');
                return String(inputs[0]).toUpperCase();
            },
            'to_lower': (inputs) => {
                if (inputs.length < 1) throw new Error('to_lower needs 1 input');
                return String(inputs[0]).toLowerCase();
            },
            
            // Output function
            'print': (inputs) => {
                if (inputs.length < 1) throw new Error('print needs 1 input');
                const output = `📤 PRINT: ${inputs[0]}`;
                this.output.push(output);
                console.log(output);
                return inputs[0];
            }
        };

        if (builtins[funcName]) {
            return builtins[funcName](inputValues);
        }

        throw new Error(`Unknown function: ${funcName}`);
    }

    async getNodeInput(node) {
        if (node.inputs.length === 0) return node.value;
        
        const inputNode = this.nodes.get(node.inputs[0]);
        return inputNode ? await this.executeNode(inputNode) : node.value;
    }

    executeOutput(input) {
        const output = `📤 OUTPUT: ${input}`;
        this.output.push(output);
        console.log(output);
        return input;
    }

    getExecutionResult() {
        const nodeResults = Array.from(this.nodes.values()).map(node => ({
            type: node.type,
            value: node.value,
            result: node.result,
            error: node.error,
            inputs: node.inputs,
            outputs: node.outputs
        }));

        return {
            success: !nodeResults.some(n => n.error),
            output: this.output,
            nodes: nodeResults
        };
    }
}
