// src/runtime/simple-engine.js - WITH CHAINING FIX
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
            let currentLine = line;
            let previousResult = null;
            
            // Keep processing the line until no more functions found
            while (this.hasFunctions(currentLine)) {
                const result = this.executeNextFunction(currentLine, previousResult);
                if (result !== undefined) {
                    previousResult = result;
                    // Remove the processed part from the line
                    currentLine = this.removeProcessedPart(currentLine, result);
                } else {
                    break;
                }
            }
        }
    }

    hasFunctions(line) {
        return line.includes('[▷');
    }

    executeNextFunction(line, previousResult) {
        try {
            // If we have a previous result, look for functions that can use it
            if (previousResult !== null) {
                const continuationMatch = line.match(/→\s*\[▷\s+(\w+)\](?:\s*←\s*\[(?:○|□)\s+([^\]]+)\])?/);
                if (continuationMatch) {
                    const [_, funcName, input] = continuationMatch;
                    console.log(`🔄 Chaining: ${previousResult} → ${funcName}${input ? ` ← ${input}` : ''}`);
                    
                    if (this.functions[funcName]) {
                        const inputs = input ? [previousResult, this.parseValue(input)] : [previousResult];
                        const result = this.functions[funcName](inputs);
                        console.log(`✅ ${funcName} chain result: ${result}`);
                        return result;
                    }
                }
            }

            // Handle multi-text concatenation
            const multiTextConcatMatch = line.match(/\[□\s+"([^"]*)"\]\s*→\s*\[▷\s+concat\](?:\s*←\s*\[□\s+"([^"]*)"\])+/);
            if (multiTextConcatMatch) {
                return this.handleMultiTextConcat(line);
            }

            // Handle mixed type concatenation
            const mixedConcatMatch = line.match(/\[□\s+"([^"]*)"\]\s*→\s*\[▷\s+concat\]\s*←\s*\[○\s+(\d+)\]/);
            if (mixedConcatMatch) {
                const [_, text, number] = mixedConcatMatch;
                console.log(`🎯 Mixed concat: "${text}" + ${number}`);
                const result = text + number;
                console.log(`✅ concat("${text}", ${number}) = "${result}"`);
                return result;
            }

            // Handle multi-input arithmetic
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

            console.log(`❌ Could not parse remaining: ${line}`);
            return undefined;
            
        } catch (error) {
            console.log(`💥 Error in line: ${error.message}`);
            return undefined;
        }
    }

    removeProcessedPart(line, result) {
        // Remove the first function and its inputs from the line
        // This is a simplified approach - in a real parser we'd track positions
        if (line.includes('→ [▷ concat] ← [○')) {
            return line.replace(/\[□\s+"[^"]*"\]\s*→\s*\[▷\s+concat\]\s*←\s*\[○\s+\d+\]/, `"${result}"`);
        } else if (line.includes('→ [▷ concat] ← [□')) {
            return line.replace(/\[□\s+"[^"]*"\]\s*→\s*\[▷\s+concat\](?:\s*←\s*\[□\s+"[^"]*"\])+/, `"${result}"`);
        } else if (line.includes('→ [▷ multiply] ← [○')) {
            return line.replace(/\[○\s+\d+\]\s*→\s*\[▷\s+multiply\](?:\s*←\s*\[○\s+\d+\])+/, result.toString());
        }
        return line;
    }

    handleMultiTextConcat(line) {
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

    parseValue(value) {
        if (!isNaN(value)) return Number(value);
        if (value === 'true') return true;
        if (value === 'false') return false;
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        return value;
    }
}
