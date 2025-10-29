// src/runtime/runtime.js
export class GlyphRuntime {
    constructor() {
        this.environment = new Map();
        this.executionStack = [];
        this.outputBuffer = [];
        this.errorHandler = null;
    }

    initialize() {
        this.environment.clear();
        this.executionStack = [];
        this.outputBuffer = [];
        
        // Initialize built-in variables
        this.setVariable('π', Math.PI);
        this.setVariable('e', Math.E);
        this.setVariable('true', true);
        this.setVariable('false', false);
        this.setVariable('null', null);
        this.setVariable('undefined', undefined);
        
        console.log('🔮 Glyph Runtime initialized');
    }

    setVariable(name, value) {
        this.environment.set(name, value);
        return value;
    }

    getVariable(name) {
        if (this.environment.has(name)) {
            return this.environment.get(name);
        }
        throw new Error(`Undefined variable: ${name}`);
    }

    hasVariable(name) {
        return this.environment.has(name);
    }

    pushExecutionContext(context) {
        this.executionStack.push({
            variables: new Map(this.environment),
            ...context
        });
    }

    popExecutionContext() {
        if (this.executionStack.length > 0) {
            const context = this.executionStack.pop();
            this.environment = context.variables;
            return context;
        }
        return null;
    }

    output(value) {
        const outputLine = `[${new Date().toISOString()}] ${value}`;
        this.outputBuffer.push(outputLine);
        console.log('📤', value);
        return value;
    }

    getOutput() {
        return [...this.outputBuffer];
    }

    clearOutput() {
        this.outputBuffer = [];
    }

    setErrorHandler(handler) {
        this.errorHandler = handler;
    }

    handleError(error, node = null) {
        const errorInfo = {
            message: error.message,
            node: node,
            timestamp: Date.now(),
            stack: error.stack
        };

        this.output(`❌ ERROR: ${error.message}`);
        
        if (this.errorHandler) {
            return this.errorHandler(errorInfo);
        }
        
        throw error;
    }

    // Type checking utilities
    getType(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    isString(value) {
        return typeof value === 'string';
    }

    isBoolean(value) {
        return typeof value === 'boolean';
    }

    isArray(value) {
        return Array.isArray(value);
    }

    // Conversion utilities
    toNumber(value) {
        if (this.isNumber(value)) return value;
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
        return num;
    }

    toString(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        return String(value);
    }

    toBoolean(value) {
        if (this.isBoolean(value)) return value;
        return Boolean(value);
    }

    // Math utilities
    mathOperation(operation, values) {
        if (!values.every(v => this.isNumber(v))) {
            throw new Error(`All inputs must be numbers for ${operation}`);
        }

        switch (operation) {
            case 'add': return values.reduce((a, b) => a + b, 0);
            case 'subtract': return values.reduce((a, b) => a - b);
            case 'multiply': return values.reduce((a, b) => a * b, 1);
            case 'divide': return values.reduce((a, b) => a / b);
            case 'power': return values.reduce((a, b) => Math.pow(a, b));
            default: throw new Error(`Unknown math operation: ${operation}`);
        }
    }

    // String utilities
    stringOperation(operation, values) {
        const strings = values.map(v => this.toString(v));
        
        switch (operation) {
            case 'concat': return strings.join('');
            case 'upper': return strings[0].toUpperCase();
            case 'lower': return strings[0].toLowerCase();
            case 'length': return strings[0].length;
            case 'trim': return strings[0].trim();
            default: throw new Error(`Unknown string operation: ${operation}`);
        }
    }

    // Debug utilities
    debugNode(node, value) {
        const debugInfo = {
            nodeId: node.id,
            nodeType: node.type,
            value: node.value,
            result: value,
            timestamp: Date.now()
        };
        
        console.log('🐛 DEBUG:', debugInfo);
        return value;
    }

    getEnvironmentSnapshot() {
        return {
            variables: Object.fromEntries(this.environment),
            executionStack: this.executionStack.length,
            outputCount: this.outputBuffer.length
        };
    }

    reset() {
        this.initialize();
        console.log('🔄 Glyph Runtime reset');
    }
}
