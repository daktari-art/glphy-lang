export class GlyphParser {
    constructor() {
        this.symbols = {
            '○': 'DATA_NODE', '□': 'TEXT_NODE', '△': 'LIST_NODE', '◇': 'BOOL_NODE',
            '▷': 'FUNCTION_NODE', '⟳': 'LOOP_NODE', '◯': 'CONDITION_NODE', 
            '⤶': 'OUTPUT_NODE', '⚡': 'ERROR_NODE', '🔄': 'ASYNC_NODE'
        };
    }

    parse(source) {
        const ast = { type: 'Program', nodes: [], connections: [], labels: {} };
        const lines = source.split('\n');
        let currentLabel = 'main';

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

            // Parse nodes and connections
            this.parseLine(line, ast, currentLabel, i);
        }

        return ast;
    }

    parseLine(line, ast, label, lineNum) {
        // Extract all nodes from line
        const nodeRegex = /\[([○□△◇▷⟳◯⤶⚡🔄])\s+([^\]]+)\]/g;
        let match;
        const lineNodes = [];

        while ((match = nodeRegex.exec(line)) !== null) {
            const node = {
                id: `node_${lineNum}_${lineNodes.length}`,
                type: this.symbols[match[1]] || 'UNKNOWN_NODE',
                glyph: match[1],
                value: this.parseValue(match[2].trim()),
                label: label,
                line: lineNum,
                position: { x: lineNodes.length * 100, y: lineNum * 50 }
            };
            lineNodes.push(node);
            ast.nodes.push(node);
        }

        // Parse connections between nodes
        this.parseConnections(line, ast, lineNodes, lineNum);
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
        if (nodes.length < 2) return;

        // Simple forward connections
        for (let i = 0; i < nodes.length - 1; i++) {
            ast.connections.push({
                from: nodes[i].id,
                to: nodes[i+1].id,
                type: 'DATA_FLOW',
                line: lineNum
            });
        }

        // Parse explicit flow arrows
        if (line.includes('→')) {
            const arrowIndex = line.indexOf('→');
            // Logic to connect nodes based on arrow position
        }
    }
}
