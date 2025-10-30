// src/runtime/simple-engine.js
export class SimpleGlyphEngine {
    constructor() {
        this.functions = {
            'multiply': (a, b) => a * b,
            'add': (a, b) => a + b,
            'print': (x) => { console.log('📤', x); return x; },
            'to_upper': (s) => s.toUpperCase()
        };
    }

    // Ultra-simple parser that JUST handles multi-input
    parseAndExecute(code) {
        const lines = code.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            console.log(`🔍 Processing: ${line}`);
            this.executeLine(line);
        }
    }

    executeLine(line) {
        // SUPER SIMPLE: Look for the pattern [data] → [function] ← [data]
        const multiInputMatch = line.match(/\[○\s+(\d+)\]\s*→\s*\[▷\s+(\w+)\]\s*←\s*\[○\s+(\d+)\]/);
        if (multiInputMatch) {
            const [_, input1, funcName, input2] = multiInputMatch;
            console.log(`🎯 Found multi-input: ${input1} → ${funcName} ← ${input2}`);
            
            if (this.functions[funcName]) {
                const result = this.functions[funcName](Number(input1), Number(input2));
                console.log(`✅ ${funcName}(${input1}, ${input2}) = ${result}`);
                return result;
            }
        }

        // Handle simple flows: [data] → [function]
        const simpleMatch = line.match(/\[□\s+"([^"]+)"\]\s*→\s*\[▷\s+(\w+)\]/);
        if (simpleMatch) {
            const [_, text, funcName] = simpleMatch;
            console.log(`🎯 Found simple flow: "${text}" → ${funcName}`);
            
            if (this.functions[funcName]) {
                const result = this.functions[funcName](text);
                console.log(`✅ ${funcName}("${text}") = ${result}`);
                return result;
            }
        }

        console.log(`❌ Could not parse: ${line}`);
    }
}
