// Glyph Runtime Environment
export class GlyphRuntime {
    constructor() {
        this.nodes = new Map();
        this.executionHistory = [];
    }

    registerNode(id, node) {
        this.nodes.set(id, node);
    }

    execute() {
        console.log('🎯 Starting Glyph execution...');
        
        // Simple linear execution for now
        for (let [id, node] of this.nodes) {
            try {
                const result = node.execute();
                this.executionHistory.push({
                    node: id,
                    status: 'success',
                    result: result,
                    timestamp: Date.now()
                });
                console.log(`✅ ${id}:`, result);
            } catch (error) {
                this.executionHistory.push({
                    node: id,
                    status: 'error',
                    error: error.message,
                    timestamp: Date.now()
                });
                console.log(`❌ ${id}:`, error.message);
            }
        }
        
        return this.executionHistory;
    }
}
