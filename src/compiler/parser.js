// Glyph Language Parser - FIXED VERSION
export class GlyphParser {
    constructor() {
        this.symbols = {
            '○': 'DATA_NODE', '□': 'TEXT_NODE', '△': 'LIST_NODE', '◇': 'BOOL_NODE',
            '▷': 'FUNCTION_NODE', '⟳': 'LOOP_NODE', '◯': 'CONDITION_NODE', 
            '⤶': 'OUTPUT_NODE', '⚡': 'ERROR_NODE', '🔄': 'ASYNC_NODE'
        };
    }

    parse(source) {
        const ast = { 
            type: 'Program', 
            nodes: [], 
            connections: [], 
            labels: {},
            metadata: { source: source }
        };

        const lines = source.split('\n');
        let currentLabel = 'main';
        let nodeCounter = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue;

            // Check for label
            const labelMatch = line.match(/^(\w+):$/);
            if (labelMatch) {
                currentLabel = labelMatch[1];
                ast.labels[currentLabel] = { start: i, nodes: [] };
                continue;
            }

            // Parse this line
            this.parseLine(line, ast, currentLabel, i, nodeCounter);
            nodeCounter += 10; // Increment counter for next line
        }

        return ast;
    }

    parseLine(line, ast, label, lineNum, startId) {
        // Extract ALL nodes from this line
        const nodeRegex = /\[([○□△◇▷⟳◯⤶⚡🔄])\s+([^\]]+)\]/g;
        const nodes = [];
        let match;
        
        while ((match = nodeRegex.exec(line)) !== null) {
            const nodeId = `node_${lineNum}_${startId + nodes.length}`;
            const node = {
                id: nodeId,
                type: this.symbols[match[1]] || 'UNKNOWN_NODE',
                glyph: match[1],
                value: this.parseValue(match[2].trim()),
                label: label,
                line: lineNum
            };
            nodes.push(node);
            ast.nodes.push(node);
        }

        if (nodes.length === 0) return;

        // Parse connections between nodes
        this.parseConnections(line, ast, nodes, lineNum);
    }

    parseValue(value) {
        // Parse numbers
        if (!isNaN(value)) return Number(value);
        // Parse booleans
        if (value === 'true') return true;
        if (value === 'false') return false;
        // Parse strings (remove quotes)
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        // Return as string
        return value;
    }

    parseConnections(line, ast, nodes, lineNum) {
        // For simple linear flow: [A] → [B] → [C]
        for (let i = 0; i < nodes.length - 1; i++) {
            ast.connections.push({
                from: nodes[i].id,
                to: nodes[i+1].id,
                type: 'DATA_FLOW',
                line: lineNum
            });
        }

        // Parse explicit arrows for complex flows
        this.parseExplicitConnections(line, ast, nodes, lineNum);
    }

    parseExplicitConnections(line, ast, nodes, lineNum) {
        // Look for right arrows (→) and left arrows (←)
        const rightArrowRegex = /→/g;
        const leftArrowRegex = /←/g;
        
        let rightMatch;
        let nodeIndex = 0;
        
        // Parse right arrows: [A] → [B] means A connects to B
        while ((rightMatch = rightArrowRegex.exec(line)) !== null) {
            if (nodeIndex < nodes.length - 1) {
                ast.connections.push({
                    from: nodes[nodeIndex].id,
                    to: nodes[nodeIndex + 1].id,
                    type: 'DATA_FLOW',
                    line: lineNum
                });
                nodeIndex++;
            }
        }

        // Parse left arrows: [B] ← [A] means A connects to B  
        // This is trickier - we need to find which nodes are around the left arrow
        let leftMatch;
        while ((leftMatch = leftArrowRegex.exec(line)) !== null) {
            // For now, assume left arrow connects the previous node to current
            if (nodeIndex > 0 && nodeIndex < nodes.length) {
                ast.connections.push({
                    from: nodes[nodeIndex].id, 
                    to: nodes[nodeIndex - 1].id,
                    type: 'DATA_FLOW',
                    line: lineNum
                });
            }
        }
    }
}
