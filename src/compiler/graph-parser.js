// src/compiler/graph-parser.js - v0.3.1 - FIX: FULL GRAPH TOKENIZATION
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
        // CRITICAL FIX: Regex to capture any node [...] OR any connector, including those with labels (e.g., ─true─→)
        this.tokenRegex = /(\[.*?\])|([→←⚡🔄⤴⤵]|─[^─]+─[→←⚡🔄⤴⤵])/g;
    }

    // Helper to extract the symbol, value, and type from a node string (e.g., [○ 10: number])
    parseNodeValue(token) {
        const content = token.substring(1, token.length - 1).trim();
        const parts = content.split(':').map(p => p.trim());
        const rawValue = parts[0] || '';
        const type = parts[1] || 'any';

        const symbol = rawValue.substring(0, 1);
        const value = rawValue.substring(1).trim();
        const nodeType = this.symbols[symbol];

        return { symbol, nodeType, value, type, token };
    }

    // The core parsing method - FIXED
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
        let nodeIdCounter = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('#') || line === '') continue; // Skip comments and empty lines

            // 1. Label Check
            if (line.endsWith(':')) {
                currentLabel = line.substring(0, line.length - 1).trim();
                ast.labels[currentLabel] = { line: i, nodes: [] };
                continue;
            }

            // 2. Tokenize the line - CRITICAL STEP
            const tokens = [];
            let match;
            this.tokenRegex.lastIndex = 0; // Reset regex state
            while ((match = this.tokenRegex.exec(line)) !== null) {
                if (match[0].trim() !== '') {
                    tokens.push({
                        value: match[0],
                        position: match.index
                    });
                }
            }

            if (tokens.length === 0) continue;

            // 3. Process Tokens to Nodes and Connections
            let lastNode = null;
            
            for (let j = 0; j < tokens.length; j++) {
                const token = tokens[j];
                const isNode = token.value.startsWith('[');
                
                if (isNode) {
                    // Create Node
                    const { symbol, nodeType, value, type } = this.parseNodeValue(token.value);
                    const newNode = {
                        id: generateUUID(),
                        nodeId: nodeIdCounter++,
                        type: nodeType,
                        value: value,
                        symbol: symbol,
                        dataType: type,
                        label: currentLabel,
                        position: token.position,
                        line: i + 1,
                        inputs: [],
                        executed: false,
                        sourceCode: token.value
                    };
                    ast.nodes.push(newNode);
                    ast.labels[currentLabel].nodes.push(newNode.id);
                    
                    // Connection logic is deferred to the connector token to handle direction.
                    lastNode = newNode; // New node becomes the potential source/destination for next connection
                    
                } else { // It is a connector (→, ←, ⚡, etc.)
                    
                    if (!lastNode) {
                        throw new Error(`Syntax Error on line ${i + 1}: Connector '${token.value}' found before any source node.`);
                    }

                    // Find the node *before* the current connector token
                    const sourceNode = this.findClosestNodeByPosition(ast.nodes, token.position);
                    
                    // Look for the next node (destination/input)
                    const nextToken = tokens[j + 1];
                    if (!nextToken || !nextToken.value.startsWith('[')) {
                        throw new Error(`Syntax Error on line ${i + 1}: Connector '${token.value}' is not followed by a node.`);
                    }

                    // The next node must be found in the AST since it must have been parsed.
                    const destinationNode = this.findClosestNodeByPosition(ast.nodes, nextToken.position);
                    
                    // Extract flow symbol and label (e.g., ─true─→)
                    const connectorMatch = token.value.match(/([→←⚡🔄⤴⤵])|─([^─]+)─([→←⚡🔄⤴⤵])/);
                    const flowSymbol = connectorMatch[1] || connectorMatch[3];
                    const flowLabel = connectorMatch[2] || null;
                    const connectionType = this.connectionTypes[flowSymbol];
                    
                    let fromNodeId, toNodeId;

                    if (flowSymbol === '→' || flowSymbol === '⚡' || flowSymbol === '🔄' || flowSymbol === '⤴' || flowSymbol === '⤵') {
                        // Forward flow: Source is before connector, destination is after.
                        fromNodeId = sourceNode.id;
                        toNodeId = destinationNode.id;
                    } else if (flowSymbol === '←') {
                        // Reverse flow (Input to a Function): Source is after connector, destination is before.
                        fromNodeId = destinationNode.id;
                        toNodeId = sourceNode.id;
                    }

                    if (fromNodeId && toNodeId) {
                         ast.connections.push({
                            id: generateUUID(),
                            from: fromNodeId,
                            to: toNodeId,
                            type: connectionType,
                            label: flowLabel
                        });
                        
                        // Increment j to skip the next token (the destination node), which we just processed
                        j++;
                    }
                }
            }
        }

        this.validateGraph(ast);
        return ast;
    }
    
    // Utility function bodies taken from snippets
    findClosestNodeByPosition(nodes, position) {
        let closest = null;
        let minDistance = Infinity;

        for (const node of nodes) {
            // Only consider nodes before or at the position
            if (node.position <= position) { 
                const distance = position - node.position;
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
            const key = `${conn.from}->${conn.to}:${conn.type}`;\n            if (!connectionSet.has(key)) {\n                connectionSet.add(key);\n                return true;\n            }\n            return false;\n        });
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
