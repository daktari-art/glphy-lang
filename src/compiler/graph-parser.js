// src/compiler/graph-parser.js - v0.3.0 - TYPE ANNOTATIONS & STABLE ID
// NOTE: For a real project, replace 'generateUUID()' with a library call (e.g., 'crypto.randomUUID()')
const generateUUID = () => `node_${Math.random().toString(36).substring(2, 9)}`; 

export class GraphParser {
    constructor() {
        this.symbols = {
            '○': 'DATA_NODE', '□': 'TEXT_NODE', '△': 'LIST_NODE', '◇': 'BOOL_NODE',
            '▷': 'FUNCTION_NODE', '⟳': 'LOOP_NODE', '◯': 'CONDITION_NODE', 
            '⤶': 'OUTPUT_NODE', '⚡': 'ERROR_NODE', '🔄': 'ASYNC_NODE'
        };
        this.connectionTypes = {
            '→': 'DATA_FLOW', 
            '←': 'DATA_FLOW',
            '⚡': 'ERROR_FLOW', 
            '🔄': 'ASYNC_FLOW',
            '⤴': 'RETURN_FLOW', 
            '⤵': 'INPUT_FLOW'
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
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue;

            // 1. Check for label (e.g., 'my_function:')
            const labelMatch = line.match(/^(\w+):$/);
            if (labelMatch) {
                currentLabel = labelMatch[1];
                ast.labels[currentLabel] = { 
                    type: 'Label', 
                    name: currentLabel, 
                    lineNumber: i + 1,
                    // In a full implementation, this object would contain references to the nodes in the block
                };
                continue;
            }

            // 2. Node Parsing Logic (UPDATED for Type Annotations)
            // Regex captures: [1] symbol, [2] value, [3] optional type annotation
            const nodeMatch = line.match(/\[(.)\s+([^\]:]+)(?::\s*(\w+))?\]/); 
            if (nodeMatch) {
                const symbol = nodeMatch[1];
                const value = nodeMatch[2].trim();
                const annotation = nodeMatch[3] ? nodeMatch[3].trim() : null; // Capture optional type annotation

                const node = {
                    id: generateUUID(), // Replaced sequential counter with stable ID
                    type: this.symbols[symbol],
                    value: this.cleanValue(value),
                    lineNumber: i + 1,
                    position: line.indexOf(nodeMatch[0]),
                    label: currentLabel,
                    dataType: annotation // NEW: Store the type annotation
                };

                ast.nodes.push(node);
                continue;
            }
            
            // 3. Connection Parsing (Remains the same as fixed v0.2.0)
            this.parseConnections(line, ast, i + 1);
        }
        
        // 4. Final validation and optimization
        this.validateGraph(ast);
        return ast;
    }
    
    cleanValue(value) {
        // Remove surrounding quotes from strings if present
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1);
        }
        return value;
    }

    parseConnections(line, ast, lineNumber) {
        const connectionRegex = new RegExp(`(${Object.keys(this.connectionTypes).map(t => '\\' + t).join('|')})`, 'g');
        const connectionMatches = Array.from(line.matchAll(connectionRegex));
        
        if (connectionMatches.length === 0) return;

        // Get all nodes on this line, sorted by position
        const nodesOnLine = ast.nodes
            .filter(n => n.lineNumber === lineNumber)
            .sort((a, b) => a.position - b.position);

        if (nodesOnLine.length === 0) return;

        connectionMatches.forEach(match => {
            const connector = match[0];
            const connType = this.connectionTypes[connector];
            const connPosition = match.index;

            // Find the closest node to the left (source) and right (destination) of the connector
            let sourceNode = null;
            let destNode = null;

            if (connector === '→' || connector === '⤴') { // Flow is L->R
                sourceNode = this.findClosestNodeLeft(nodesOnLine, connPosition);
                destNode = this.findClosestNodeRight(nodesOnLine, connPosition + connector.length);
            } else if (connector === '←') { // Flow is R->L (Reverse Data Flow)
                // Reverse flow means the node on the RIGHT is the source
                sourceNode = this.findClosestNodeRight(nodesOnLine, connPosition + connector.length);
                destNode = this.findClosestNodeLeft(nodesOnLine, connPosition);
            } else { // Handle ERROR_FLOW (⚡) etc. - Default to L->R flow direction
                sourceNode = this.findClosestNodeLeft(nodesOnLine, connPosition);
                destNode = this.findClosestNodeRight(nodesOnLine, connPosition + connector.length);
            }

            if (sourceNode && destNode) {
                ast.connections.push({
                    from: sourceNode.id,
                    to: destNode.id,
                    type: connType,
                    connector: connector,
                    lineNumber: lineNumber
                });
            } else {
                 console.warn(`⚠️ Warning: Unconnected flow element "${connector}" on line ${lineNumber}`);
            }
        });
    }

    // Utility functions to find the closest node left/right (used in parseConnections)

    findClosestNodeLeft(nodes, position) {
        let closest = null;
        let maxDistance = -Infinity;
        
        for (const node of nodes) {
            if (node.position < position) {
                // Ensure the node is actually to the left of the connector
                const distance = position - (node.position + node.value.length + 5); // 5 is estimate for brackets/spaces
                if (distance > maxDistance) {
                    maxDistance = distance;
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

    removeDuplicateConnections(connections) {
        const connectionSet = new Set();
        return connections.filter(conn => {
            const key = `${conn.from}->${conn.to}:${conn.type}`;
            if (!connectionSet.has(key)) {
                connectionSet.add(key);
                return true;
            }
            return false;
        });
    }
    
    validateGraph(ast) {
        // Remove duplicate connections from entire AST
        ast.connections = this.removeDuplicateConnections(ast.connections);

        // Check for orphaned nodes
        const connectedNodes = new Set();
        ast.connections.forEach(conn => {
            connectedNodes.add(conn.from);
            connectedNodes.add(conn.to);
        });
        
        const orphanedNodes = ast.nodes.filter(node => !connectedNodes.has(node.id) && 
                                                    !['DATA_NODE', 'TEXT_NODE', 'BOOL_NODE', 'LIST_NODE'].includes(node.type));
        
        if (orphanedNodes.length > 0) {
            // Note: Data nodes are often intended as starting points and can be 'orphaned'
            console.warn('⚠️  Found potential orphaned function/output nodes:', orphanedNodes.map(n => `${n.type}(\"${n.value}\")`));
        }
    }
}
