// src/runtime/simple-engine.js - FIXED CONCATENATION VERSION
export class SimpleGlyphEngine {
    constructor() {
        this.functions = {
            'multiply': (inputs) => inputs.reduce((a, b) => a * b, 1),
            'add': (inputs) => inputs.reduce((a, b) => a + b, 0),
            'print': (inputs) => { 
                const output = `📤 ${inputs[0]}`;
                console.log(output);
                return inputs[0];
            },
            'to_upper': (inputs) => String(inputs[0]).toUpperCase(),
            'concat': (inputs) => inputs.map(String).join('')
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
            // FIX 1: Handle multiple text concatenation
            const multiTextConcatMatch = line.match(/\[□\s+"([^"]*)"\]\s*→\s*\[▷\s+concat\](?:\s*←\s*\[□\s+"([^"]*)"\])+/);
            if (multiTextConcatMatch) {
                return this.handleMultiTextConcat(line);
            }

            // FIX 2: Handle mixed type concatenation
            const mixedConcatMatch = line.match(/\[□\s+"([^"]*)"\]\s*→\s*\[▷\s+concat\]\s*←\s*\[○\s+(\d+)\]/);
            if (mixedConcatMatch) {
                const [_, text, number] = mixedConcatMatch;
                console.log(`🎯 Mixed concat: "${text}" + ${number}`);
                const result = text + number;
                console.log(`✅ concat("${text}", ${number}) = "${result}"`);
                return result;
            }

            // FIX 3: Handle empty strings
            const emptyStringMatch = line.match(/\[□\s+""\]\s*→\s*\[▷\s+concat\]\s*←\s*\[□\s+"([^"]+)"\]/);
            if (emptyStringMatch) {
                const [_, text] = emptyStringMatch;
                console.log(`🎯 Empty string concat: "" + "${text}"`);
                const result = text;
                console.log(`✅ concat("", "${text}") = "${result}"`);
                return result;
            }

            // Handle multi-input arithmetic (this works)
            const multiInputMatch = line.match(/\[○\s+(\d+)\]\s*→\s*\[▷\s+(\w+)\](?:\s*←\s*\[○\s+(\d+)\])+/);
            if (multiInputMatch) {
                return this.handleMultiInput(line, multiInputMatch);
            }

            // Handle simple flows
            const simpleMatch = line.match(/\[□\s+"([^"]+)"\]\s*→\s*\[▷\s+(\w+)\]/);
            if (simpleMatch) {
                const [_, text, funcName] = simpleMatch;
                console.log(`🎯 Simple flow: "${text}" → ${funcName}`);
                
                if (this.functions[funcName]) {
                    const result = this.functions[funcName]([text]);
                    console.log(`✅ ${funcName}("${text}") = "${result}"`);
                    return result;
                }
            }

            console.log(`❌ Could not parse: ${line}`);
            
        } catch (error) {
            console.log(`💥 Error in line: ${error.message}`);
        }
    }

    handleMultiTextConcat(line) {
        // Extract ALL text inputs from the line
        const textMatches = line.matchAll(/\[□\s+"([^"]*)"\]/g);
        const texts = [];
        
        for (const match of textMatches) {
            texts.push(match[1]);
        }
        
        console.log(`🎯 Multi-text concat: "${texts.join('" + "')}"`);
        const result = texts.join('');
        console.log(`✅ concat(${texts.map(t => `"${t}"`).join(', ')}) = "${result}"`);
        return result;
    }

    handleMultiInput(line, match) {
        const inputs = [];
        const funcName = match[2];
        
        // Find all [○ number] patterns
        const inputMatches = line.matchAll(/\[○\s+(\d+)\]/g);
        for (const inputMatch of inputMatches) {
            inputs.push(Number(inputMatch[1]));
        }
        
        console.log(`🎯 Multi-input: ${inputs.join(' → ')} → ${funcName}`);
        
        if (this.functions[funcName] && inputs.length >= 2) {
            const result = this.functions[funcName](inputs);
            console.log(`✅ ${funcName}(${inputs.join(', ')}) = ${result}`);
            return result;
        } else {
            throw new Error(`Function ${funcName} not found or insufficient inputs`);
        }
    }
}
