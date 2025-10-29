export class GlyphParser {
    constructor() {
        this.tokens = [];
        this.current = 0;
    }

    parse(source) {
        this.tokens = this.tokenize(source);
        return this.parseProgram();
    }

    tokenize(source) {
        const tokens = [];
        const lines = source.split('\n');
        
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            // Match nodes: [○ value], [▷ function], etc.
            const nodeMatch = line.match(/\[([○□△◇▷⟳◯⤶⚡🔄])\s+([^\]]+)\]/g);
            if (nodeMatch) {
                nodeMatch.forEach(node => {
                    const match = node.match(/\[([○□△◇▷⟳◯⤶⚡🔄])\s+([^\]]+)\]/);
                    tokens.push({
                        type: 'NODE',
                        glyph: match[1],
                        value: match[2].trim(),
                        raw: node
                    });
                });
            }

            // Match connections
            if (line.includes('→')) tokens.push({ type: 'FLOW', direction: 'right' });
            if (line.includes('←')) tokens.push({ type: 'FLOW', direction: 'left' });
        }

        return tokens;
    }

    parseProgram() {
        const program = {
            type: 'Program',
            body: [],
            connections: []
        };

        let i = 0;
        while (i < this.tokens.length) {
            const token = this.tokens[i];
            
            if (token.type === 'NODE') {
                program.body.push(this.parseNode(token));
            } else if (token.type === 'FLOW') {
                program.connections.push({
                    type: 'Connection',
                    direction: token.direction,
                    from: i > 0 ? this.tokens[i-1] : null,
                    to: i < this.tokens.length - 1 ? this.tokens[i+1] : null
                });
            }
            i++;
        }

        return program;
    }

    parseNode(token) {
        return {
            type: this.mapGlyphToType(token.glyph),
            value: this.parseValue(token.value),
            glyph: token.glyph,
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    mapGlyphToType(glyph) {
        const mapping = {
            '○': 'DataNode',
            '□': 'TextNode', 
            '△': 'ListNode',
            '◇': 'BoolNode',
            '▷': 'FunctionNode',
            '⟳': 'LoopNode',
            '◯': 'ConditionNode',
            '⤶': 'OutputNode',
            '⚡': 'ErrorNode',
            '🔄': 'AsyncNode'
        };
        return mapping[glyph] || 'UnknownNode';
    }

    parseValue(value) {
        // Parse numbers, booleans, strings
        if (!isNaN(value)) return Number(value);
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value.startsWith('"') && value.endsWith('"')) 
            return value.slice(1, -1);
        return value;
    }
}
