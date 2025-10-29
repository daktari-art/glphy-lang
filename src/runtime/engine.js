export class GlyphEngine {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.executionContext = new Map();
    }

    loadProgram(ast) {
        this.nodes.clear();
        this.connections = ast.connections || [];
        
        ast.body.forEach(node => {
            this.nodes.set(node.id, {
                ...node,
                executed: false,
                result: null,
                error: null
            });
        });
    }

    async execute() {
        console.log('🚀 Starting Glyph Execution...');
        
        // Simple linear execution for now
        for (let [id, node] of this.nodes) {
            if (!node.executed) {
                try {
                    const result = await this.executeNode(node);
                    node.result = result;
                    node.executed = true;
                    console.log(`✅ ${node.type}:`, result);
                } catch (error) {
                    node.error = error;
                    console.log(`❌ ${node.type}:`, error.message);
                }
            }
        }

        return this.getExecutionResult();
    }

    async executeNode(node) {
        switch (node.type) {
            case 'DataNode':
            case 'TextNode':
            case 'BoolNode':
                return node.value;
                
            case 'OutputNode':
                const inputValue = await this.getNodeInput(node);
                console.log('📤 OUTPUT:', inputValue);
                return inputValue;
                
            case 'FunctionNode':
                return await this.executeFunction(node);
                
            default:
                return node.value;
        }
    }

    async getNodeInput(node) {
        // Find connections that point to this node
        const inputConnections = this.connections.filter(conn => 
            conn.to && conn.to.id === node.id
        );
        
        if (inputConnections.length > 0) {
            const sourceNode = inputConnections[0].from;
            return sourceNode ? this.nodes.get(sourceNode.id)?.result : null;
        }
        
        return node.value;
    }

    async executeFunction(node) {
        const functionName = node.value;
        const inputValue = await this.getNodeInput(node);
        
        // Built-in functions
        const builtins = {
            'print': (x) => { console.log(x); return x; },
            'to_upper': (x) => x.toUpperCase(),
            'add': (x, y) => x + y,
            'multiply': (x, y) => x * y
        };

        if (builtins[functionName]) {
            return builtins[functionName](inputValue);
        }
        
        throw new Error(`Unknown function: ${functionName}`);
    }

    getExecutionResult() {
        const results = Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            type: node.type,
            value: node.value,
            result: node.result,
            error: node.error,
            executed: node.executed
        }));

        return {
            success: !results.some(r => r.error),
            results: results,
            finalOutput: results.find(r => r.type === 'OutputNode')?.result
        };
    }
}
