export class GlyphEngine {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.variables = new Map();
        this.callStack = [];
        this.output = [];
    }

    loadProgram(ast) {
        this.ast = ast;
        this.nodes.clear();
        this.connections = ast.connections;
        this.variables.clear();
        this.output = [];

        // Register all nodes
        ast.nodes.forEach(node => {
            this.nodes.set(node.id, { ...node, executed: false, result: null });
        });
    }

    async execute(startLabel = 'main') {
        console.log(`🚀 Executing Glyph program: ${startLabel}`);
        
        const startNodes = this.ast.nodes.filter(node => node.label === startLabel);
        if (startNodes.length === 0) {
            throw new Error(`No nodes found for label: ${startLabel}`);
        }

        // Execute in order (simple linear execution for now)
        for (const node of startNodes) {
            await this.executeNode(node);
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
                    
                case 'OUTPUT_NODE':
                    const inputValue = await this.getNodeInput(node);
                    result = this.executeOutput(node, inputValue);
                    break;
                    
                case 'FUNCTION_NODE':
                    const funcInput = await this.getNodeInput(node);
                    result = await this.executeFunction(node, funcInput);
                    break;
                    
                case 'CONDITION_NODE':
                    const conditionInput = await this.getNodeInput(node);
                    result = await this.executeCondition(node, conditionInput);
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
            throw error;
        }
    }

    async getNodeInput(node) {
        // Find incoming connections
        const incoming = this.connections.filter(conn => conn.to === node.id);
        if (incoming.length === 0) return node.value;

        // Get result from source node
        const sourceNode = this.nodes.get(incoming[0].from);
        if (!sourceNode) return null;

        return await this.executeNode(sourceNode);
    }

    executeOutput(node, input) {
        const output = `📤 OUTPUT: ${input}`;
        this.output.push(output);
        console.log(output);
        return input;
    }

    async executeFunction(node, input) {
        const funcName = node.value;
        
        // Built-in function library
        const builtins = {
            // Math
            'add': (a, b) => a + b,
            'subtract': (a, b) => a - b,
            'multiply': (a, b) => a * b,
            'divide': (a, b) => a / b,
            
            // Text
            'to_upper': (str) => str.toUpperCase(),
            'to_lower': (str) => str.toLowerCase(),
            'length': (str) => str.length,
            
            // Logic
            'not': (val) => !val,
            'equals': (a, b) => a === b,
            
            // Output
            'print': (val) => { 
                const output = `📤 PRINT: ${val}`;
                this.output.push(output);
                console.log(output);
                return val;
            }
        };

        if (builtins[funcName]) {
            // For now, use the input as single argument
            return builtins[funcName](input);
        }

        throw new Error(`Unknown function: ${funcName}`);
    }

    async executeCondition(node, input) {
        // For now, treat condition as boolean check
        return Boolean(input);
    }

    getExecutionResult() {
        const nodeResults = Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            type: node.type,
            value: node.value,
            result: node.result,
            error: node.error,
            executed: node.executed
        }));

        return {
            success: !nodeResults.some(n => n.error),
            output: this.output,
            nodes: nodeResults,
            variables: Object.fromEntries(this.variables)
        };
    }
}
