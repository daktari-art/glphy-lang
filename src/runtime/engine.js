// src/runtime/engine.js - v0.3.0 - N-ARY FIXES & SCOPE SUPPORT
export class GlyphEngine {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.output = [];
        this.variables = new Map();
        this.executionHistory = [];
        this.builtinFunctions = this.initializeBuiltins();
        this.callStack = []; // NEW: Manages function execution context
        this.scopes = new Map(); // NEW: Maps node IDs to their local scope
    }

    initializeBuiltins() {
        return {
            // Math operations - N-ARY FIXED in v0.3.0
            'multiply': (inputs) => {
                // Ensure inputs are numbers before reducing, as per Type Inference goal
                const numericInputs = inputs.map(Number);
                if (numericInputs.length < 2) throw new Error('Multiply needs at least 2 inputs');
                return numericInputs.reduce((a, b) => a * b, 1);
            },
            'add': (inputs) => {
                const numericInputs = inputs.map(Number);
                if (numericInputs.length < 2) throw new Error('Add needs at least 2 inputs');
                return numericInputs.reduce((a, b) => a + b, 0);
            },
            'subtract': (inputs) => {
                const numericInputs = inputs.map(Number);
                if (numericInputs.length < 2) throw new Error('Subtract needs at least 2 inputs');
                // N-ary fix: Start with first input, subtract all subsequent inputs (a - b - c - ...)
                return numericInputs.slice(1).reduce((a, b) => a - b, numericInputs[0]);
            },
            'divide': (inputs) => {
                const numericInputs = inputs.map(Number);
                if (numericInputs.length < 2) throw new Error('Divide needs at least 2 inputs');
                // N-ary fix: Start with first input, divide by all subsequent inputs (a / b / c / ...)
                return numericInputs.slice(1).reduce((a, b) => {
                    if (b === 0) throw new Error('Division by zero detected');
                    return a / b;
                }, numericInputs[0]);
            },
            'concat': (inputs) => {
                // Concatenates all inputs as strings
                return inputs.map(String).join('');
            },
            'print': (inputs) => {
                const output = `📤 PRINT: ${inputs.join(', ')}`;
                this.output.push(output);
                console.log(output);
                return inputs[0]; // Return the primary input for chaining
            },
            'to_upper': (inputs) => String(inputs[0]).toUpperCase(),
            'to_lower': (inputs) => String(inputs[0]).toLowerCase(),
            'trim': (inputs) => String(inputs[0]).trim(),
            'length': (inputs) => String(inputs[0]).length,
            // Type Conversion
            'to_number': (inputs) => Number(inputs[0]),
            'to_string': (inputs) => String(inputs[0]),
            'to_boolean': (inputs) => Boolean(inputs[0]),
        };
    }

    // --- Core Execution Logic ---

    loadProgram(ast) {
        this.nodes = new Map(ast.nodes.map(node => [node.id, { ...node, result: null, executed: false, error: null }]));
        this.connections = ast.connections;
        this.ast = ast; // Keep AST reference for scope lookup
        this.output = [];
        this.executionHistory = [];
        this.callStack = [];
        this.scopes = new Map();
        this.dependencyMap = this.resolveDependencies();
    }

    resolveDependencies() {
        // Maps node ID to a list of node IDs it depends on
        const dependencyMap = new Map();
        for (const node of this.nodes.values()) {
            dependencyMap.set(node.id, []);
        }

        for (const conn of this.connections) {
            // A node (conn.to) depends on the result of the source node (conn.from)
            if (conn.type === 'DATA_FLOW' || conn.type === 'RETURN_FLOW') {
                dependencyMap.get(conn.to).push(conn.from);
            }
        }
        return dependencyMap;
    }

    getReadyNodes() {
        const readyNodes = [];
        for (const node of this.nodes.values()) {
            if (node.executed || node.error) continue;

            const dependencies = this.dependencyMap.get(node.id);
            const allDepsExecuted = dependencies.every(depId => this.nodes.get(depId).executed);

            if (allDepsExecuted) {
                readyNodes.push(node);
            }
        }
        return readyNodes;
    }

    async execute() {
        let executionQueue = this.getInitialNodes(); // Start with DATA_NODES and INPUT_FLOW targets
        let safeCounter = 0;
        const MAX_STEPS = this.nodes.size * 10; // Safety limit for complex graphs

        while (executionQueue.length > 0 && safeCounter < MAX_STEPS) {
            const nextQueue = [];
            
            // Execute all nodes ready in the current step (potential parallelism)
            for (const node of executionQueue) {
                await this.executeNode(node);
                
                // Add successful node's immediate followers to the next queue
                if (node.executed && !node.error) {
                    const followers = this.connections
                        .filter(conn => conn.from === node.id && (conn.type === 'DATA_FLOW' || conn.type === 'ERROR_FLOW'))
                        .map(conn => this.nodes.get(conn.to));
                    nextQueue.push(...followers);
                }
            }

            // After parallel execution, update the queue with any newly ready nodes
            const newReadyNodes = this.getReadyNodes();
            const uniqueNextQueue = Array.from(new Set([...nextQueue, ...newReadyNodes]));
            executionQueue = uniqueNextQueue.filter(n => !n.executed && !n.error);

            safeCounter++;
        }

        if (safeCounter >= MAX_STEPS) {
            console.error('⚠️ Execution halted: Exceeded maximum safe execution steps. Possible infinite loop or highly complex graph.');
        }

        return this.getExecutionResult();
    }

    getInitialNodes() {
        // Find all nodes that are DATA_NODE or nodes that are targets of an INPUT_FLOW connection, 
        // and have no DATA_FLOW dependencies.
        const allDependencies = new Set(this.connections.filter(c => c.type === 'DATA_FLOW').map(c => c.to));
        
        return Array.from(this.nodes.values()).filter(node => 
            (node.type === 'DATA_NODE' || node.type === 'TEXT_NODE' || node.type === 'BOOL_NODE' || node.type === 'LIST_NODE') &&
            !allDependencies.has(node.id)
        );
    }

    async executeNode(node) {
        if (node.executed) return;

        this.executionHistory.push({ id: node.id, type: node.type, start: Date.now() });

        try {
            switch (node.type) {
                case 'DATA_NODE':
                case 'TEXT_NODE':
                case 'LIST_NODE':
                case 'BOOL_NODE':
                    // Data nodes already hold their result (value)
                    node.result = node.value; 
                    break;

                case 'FUNCTION_NODE':
                    const inputConnections = this.connections.filter(conn => conn.to === node.id && (conn.type === 'DATA_FLOW' || conn.type === 'RETURN_FLOW'));
                    const inputs = inputConnections
                        .map(conn => this.nodes.get(conn.from).result)
                        .filter(result => result !== null); // Filter out nulls from nodes that haven't produced a result yet
                    
                    if (inputs.length !== inputConnections.length) {
                         // Should not happen if getReadyNodes is correct, but safe check
                         throw new Error(`Missing inputs for function ${node.value}`);
                    }
                    
                    node.result = await this.executeFunction(node, inputs);
                    break;
                
                case 'OUTPUT_NODE':
                    const outputInputs = this.connections.filter(conn => conn.to === node.id && conn.type === 'DATA_FLOW');
                    if (outputInputs.length > 0) {
                        const inputResult = this.nodes.get(outputInputs[0].from).result;
                        this.executeOutput(inputResult);
                        node.result = inputResult;
                    }
                    break;

                // TO BE IMPLEMENTED IN V0.4.0: CONDITION_NODE, LOOP_NODE, ASYNC_NODE, ERROR_NODE
                case 'CONDITION_NODE':
                case 'LOOP_NODE':
                case 'ASYNC_NODE':
                case 'ERROR_NODE':
                    throw new Error(`Execution of node type ${node.type} is not yet implemented (v0.4.0 target).`);

                default:
                    throw new Error(`Unknown node type: ${node.type}`);
            }
            node.executed = true;

        } catch (error) {
            node.error = error.message;
            node.executed = true; // Mark as executed but failed
            
            // v0.3.0 ERROR FLOW: Check for ERROR_FLOW (⚡) connections
            const errorConnections = this.connections.filter(conn => conn.from === node.id && conn.type === 'ERROR_FLOW');
            if (errorConnections.length > 0) {
                // In a real implementation, this would route the error message as data to the next node
                console.warn(`💥 Error in node ${node.id} (${node.value}) routed via ERROR_FLOW.`);
                // For now, we only log and mark node.error
            } else {
                 // If no error flow is defined, propagate the error (stop execution)
                 throw error;
            }
        }
    }

    async executeFunction(node, inputs) {
        const funcName = node.value;
        
        if (this.builtinFunctions[funcName]) {
            return this.builtinFunctions[funcName](inputs);
        }
        
        // v0.3.0 SCOPE/RECURSION STUB: Handle User-Defined Functions (Labels)
        const funcBlock = this.ast.labels[funcName];
        if (funcBlock) {
            // Logic for pushing scope, mapping inputs, and executing block
            this.callStack.push({ caller: node.id, funcName, inputs });
            
            // NOTE: Full function execution requires a major change to the engine's control loop.
            // For now, we signal that this feature is in development.
            throw new Error(`Scoped function '${funcName}' found, but full execution is a v0.4.0 feature.`);
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
            // Exclude detailed inputs/outputs to keep JSON small
        }));

        const success = !nodeResults.some(n => n.error && n.type !== 'ERROR_NODE'); // A failed node that didn't use ERROR_FLOW means failure
        const executedNodes = nodeResults.filter(n => n.executed).length;

        return {
            success,
            output: this.output,
            statistics: {
                totalNodes: this.nodes.size,
                executedNodes: executedNodes,
                outputCount: this.output.length
            },
            executionHistory: this.executionHistory
        };
    }
}
