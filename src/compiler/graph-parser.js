// src/compiler/graph-parser.js - CORRECTED VERSION
export class GraphParser {
    constructor() {
        this.symbols = {
            '○': 'DATA_NODE', '□': 'TEXT_NODE', '△': 'LIST_NODE', '◇': 'BOOL_NODE',
            '▷': 'FUNCTION_NODE', '⟳': 'LOOP_NODE', '◯': 'CONDITION_NODE', 
            '⤶': 'OUTPUT_NODE', '⚡': 'ERROR_NODE', '🔄': 'ASYNC_NODE'
        };
        this.connectionTypes = {
            '→': 'DATA_FLOW', '⚡': 'ERROR_FLOW', '🔄': 'ASYNC_FLOW',
            '⤴': 'RETURN_FLOW', '⤵': 'INPUT_FLOW'
        };
    }

    parse(source) {
        const ast = { 
            type: 'Program', 
            nodes: [], 
            connections: [], 
            labels: {},
            metadata: { source, timestamp: Date.now() }
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

            // Parse this line as a graph
            this.parseGraphLine(line, ast, currentLabel, i, nodeCounter);
            nodeCounter += 100; // Space for multiple nodes per line
        }

        this.validateGraph(ast);
        return ast;
    }

    parseGraphLine(line, ast, label, lineNum, startId) {
        // Extract ALL nodes with their exact positions
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
                line: lineNum,
                position: match.index,
                raw: match[0]
            };
            nodes.push(node);
            ast.nodes.push(node);
            
            // Add to label if defined
            if (ast.labels[label]) {
                ast.labels[label].nodes.push(nodeId);
            }
        }

        if (nodes.length === 0) return;

        // Parse ALL connections as graph edges
        this.parseGraphConnections(line, ast, nodes, lineNum);
    }

    parseValue(value) {
        // Parse numbers (integers and floats)
        if (!isNaN(value) && value.trim() !== '') {
            return Number(value);
        }
        // Parse booleans
        if (value === 'true') return true;
        if (value === 'false') return false;
        // Parse strings (remove quotes)
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        // Return as string (for function names, variables, etc)
        return value;
    }

    parseGraphConnections(line, ast, nodes, lineNum) {
        const newConnections = [];

        // Find ALL arrows and their positions
        const arrowRegex = /(→|←|⚡|🔄|⤴|⤵)/g;
        const arrows = [];
        let arrowMatch;
        
        while ((arrowMatch = arrowRegex.exec(line)) !== null) {
            arrows.push({
                glyph: arrowMatch[1],
                position: arrowMatch.index,
                type: this.connectionTypes[arrowMatch[1]] || 'UNKNOWN_FLOW'
            });
        }

        // For each arrow, find the closest nodes on left and right
        arrows.forEach(arrow => {
            const leftNode = this.findClosestNodeLeft(nodes, arrow.position);
            const rightNode = this.findClosestNodeRight(nodes, arrow.position);
            
            if (leftNode && rightNode) {
                let fromNode, toNode;
                
                if (arrow.glyph === '←') {
                    // Left arrow: right → left
                    fromNode = rightNode;
                    toNode = leftNode;
                } else {
                    // Right arrow and others: left → right
                    fromNode = leftNode;
                    toNode = rightNode;
                }
                
                // Avoid duplicate connections
                const existingConn = ast.connections.find(conn => 
                    conn.from === fromNode.id && conn.to === toNode.id
                );
                
                if (!existingConn) {
                    newConnections.push({
                        from: fromNode.id,
                        to: toNode.id,
                        type: arrow.type,
                        glyph: arrow.glyph,
                        line: lineNum
                    });
                }
            }
        });

        // Auto-connect sequential nodes if no explicit arrows (backward compatibility)
        if (arrows.length === 0 && nodes.length > 1) {
            for (let i = 0; i < nodes.length - 1; i++) {
                newConnections.push({
                    from: nodes[i].id,
                    to: nodes[i+1].id,
                    type: 'DATA_FLOW',
                    glyph: '→',
                    line: lineNum,
                    implicit: true
                });
            }
        }

        // Add all new connections to AST
        ast.connections.push(...newConnections);

        // DEBUG: Log the connections we're creating
        console.log(`🔗 Line ${lineNum} connections:`, newConnections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            return `${fromNode?.glyph}(${fromNode?.value}) → ${toNode?.glyph}(${toNode?.value})`;
        }));
    }

    findClosestNodeLeft(nodes, position) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const node of nodes) {
            const nodeEnd = node.position + node.raw.length;
            if (nodeEnd <= position) {
                const distance = position - nodeEnd;
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = node;
                }
            }
        }
        return closest;
    }

    findClosestNodeRight(nodes, position) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const node of nodes) {
            if (node.position >= position) {
                const distance = node.position - position;
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = node;
                }
            }
        }
        return closest;
    }

    validateGraph(ast) {
        // Check for orphaned nodes
        const connectedNodes = new Set();
        ast.connections.forEach(conn => {
            connectedNodes.add(conn.from);
            connectedNodes.add(conn.to);
        });
        
        const orphanedNodes = ast.nodes.filter(node => !connectedNodes.has(node.id));
        if (orphanedNodes.length > 0) {
            console.warn('⚠️  Found orphaned nodes:', orphanedNodes.map(n => n.id));
        }

        // Check for duplicate node IDs
        const nodeIds = ast.nodes.map(n => n.id);
        const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            throw new Error(`Duplicate node IDs found: ${duplicates.join(', ')}`);
        }
    }
}
