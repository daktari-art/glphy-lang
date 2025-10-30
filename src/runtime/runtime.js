// src/runtime/simple-engine.js (IMPROVED VERSION)
export class SimpleGlyphEngine {
    constructor() {
        this.functions = {
            'multiply': (a, b) => a * b,
            'add': (a, b) => a + b,
            'print': (x) => { console.log('📤', x); return x; },
            'to_upper': (s) => s.toUpperCase(),
            'concat': (a, b) => String(a) + String(b)
        };
    }

    parseAndExecute(code) {
        const lines = code.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            console.log(`🔍 Processing: ${line}`);
            this.executeLine(line);
        }
    }

    executeLine(line) {
        try {
            // Handle multi-input: [data] → [function] ← [data] ← [data]...
            const multiInputMatch = line.match(/\[○\s+(\d+)\]\s*→\s*\[▷\s+(\w+)\](?:\s*←\s*\[○\s+(\d+)\])+/);
            if (multiInputMatch) {
                return this.handleMultiInput(line, multiInputMatch);
            }

            // Handle triple+ inputs: [data] → [function] ← [data] ← [data]
            const tripleInputMatch = line.match(/\[○\s+(\d+)\]\s*→\s*\[▷\s+(\w+)\]\s*←\s*\[○\s+(\d+)\]\s*←\s*\[○\s+(\d+)\]/);
            if (tripleInputMatch) {
                const [_, input1, funcName, input2, input3] = tripleInputMatch;
                console.log(`🎯 Found triple-input: ${input1} → ${funcName} ← ${input2} ← ${input3}`);
                
                if (this.functions[funcName]) {
                    const result = this.functions[funcName](
                        this.functions[funcName](Number(input1), Number(input2)),
                        Number(input3)
                    );
                    console.log(`✅ ${funcName}(${input1}, ${input2}, ${input3}) = ${result}`);
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
                    console.log(`✅ ${funcName}("${text}") = "${result}"`);
                    return result;
                }
            }

            // Handle mixed concat: [text] → [concat] ← [number]
            const mixedConcatMatch = line.match(/\[□\s+"([^"]+)"\]\s*→\s*\[▷\s+concat\]\s*←\s*\[○\s+(\d+)\]/);
            if (mixedConcatMatch) {
                const [_, text, number] = mixedConcatMatch;
                console.log(`🎯 Found mixed concat: "${text}" → concat ← ${number}`);
                
                const result = String(text) + String(number);
                console.log(`✅ concat("${text}", ${number}) = "${result}"`);
                return result;
            }

            console.log(`❌ Could not parse: ${line}`);
            
        } catch (error) {
            console.log(`💥 Error in line: ${error.message}`);
        }
    }

    handleMultiInput(line, match) {
        // Extract all inputs using a more flexible approach
        const inputs = [];
        const funcName = match[2];
        
        // Find all [○ number] patterns
        const inputMatches = line.matchAll(/\[○\s+(\d+)\]/g);
        for (const inputMatch of inputMatches) {
            inputs.push(Number(inputMatch[1]));
        }
        
        console.log(`🎯 Found multi-input: ${inputs.join(' → ')} → ${funcName}`);
        
        if (this.functions[funcName] && inputs.length >= 2) {
            let result = inputs[0];
            for (let i = 1; i < inputs.length; i++) {
                result = this.functions[funcName](result, inputs[i]);
            }
            console.log(`✅ ${funcName}(${inputs.join(', ')}) = ${result}`);
            return result;
        } else {
            throw new Error(`Function ${funcName} not found or insufficient inputs`);
        }
    }
}
