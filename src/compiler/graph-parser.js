// src/compiler/graph-parser.js - FIXED CONNECTION PARSING
export class GraphParser {
    constructor() {
        this.symbols = {
            '○': 'DATA_NODE', '□': 'TEXT_NODE', '△': 'LIST_NODE', '◇': 'BOOL_NODE',
            '▷': 'FUNCTION_NODE', '⟳': 'LOOP_NODE', '◯': 'CONDITION_NODE', 
            '⤶': 'OUTPUT_NODE', '⚡': 'ERROR_NODE', '🔄': 'ASYNC_NODE'
        };
        this.connectionTypes = {
            '→': 'DATA_FLOW', 
            '←': 'DATA_FLOW',  // FIX: Left arrows are also data flow
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
                    // Left arrow: data flows FROM right node TO left node
                    fromNode = rightNode;
                    toNode = leftNode;
                } else {
                    // Right arrow and others: data flows FROM left node TO right node
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

        // CRITICAL FIX: Correct function output flows
        this.correctFunctionOutputFlows(nodes, newConnections, lineNum);

        // Remove duplicate connections before adding
        const uniqueConnections = this.removeDuplicateConnections(newConnections);

        // Add all unique connections to AST
        ast.connections.push(...uniqueConnections);

        // DEBUG: Log the connections we're creating
        console.log(`🔗 Line ${lineNum} connections:`, uniqueConnections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            return `${fromNode?.type}("${fromNode?.value}") ${conn.glyph} ${toNode?.type}("${toNode?.value}")`;
        }));
    }

    correctFunctionOutputFlows(nodes, connections, lineNum) {
        // Find all function nodes
        const functionNodes = nodes.filter(node => node.type === 'FUNCTION_NODE');
        
        functionNodes.forEach(funcNode => {
            // Find all inputs to this function
            const funcInputs = connections.filter(conn => conn.to === funcNode.id);
            
            // Find all outputs from the input nodes that go to nodes other than this function
            funcInputs.forEach(inputConn => {
                const inputNodeId = inputConn.from;
                const inputNode = nodes.find(n => n.id === inputNodeId);
                
                if (inputNode && ['DATA_NODE', 'TEXT_NODE'].includes(inputNode.type)) {
                    // Find outputs from this input node that bypass the function
                    const bypassConnections = connections.filter(conn => 
                        conn.from === inputNodeId && 
                        conn.to !== funcNode.id &&
                        !functionNodes.some(fn => fn.id === conn.to) // Not going to another function
                    );
                    
                    // Replace bypass connections with function output connections
                    bypassConnections.forEach(bypassConn => {
                        const existingFuncOutput = connections.find(conn => 
                            conn.from === funcNode.id && conn.to === bypassConn.to
                        );
                        
                        if (!existingFuncOutput) {
                            // Add function output connection
                            connections.push({
                                from: funcNode.id,
                                to: bypassConn.to,
                                type: 'DATA_FLOW',
                                glyph: '→',
                                line: lineNum,
                                corrected: true
                            });
                            
                            // Remove the bypass connection
                            const bypassIndex = connections.findIndex(conn => 
                                conn.from === bypassConn.from && conn.to === bypassConn.to
                            );
                            if (bypassIndex !== -1) {
                                connections.splice(bypassIndex, 1);
                            }
                            
                            console.log(`🔄 Corrected flow: ${funcNode.type}("${funcNode.value}") → ${bypassConn.to} (was ${inputNode.type}("${inputNode.value}") → ${bypassConn.to})`);
                        }
                    });
                }
            });
        });
    }

    removeDuplicateConnections(connections) {
        const unique = [];
        const seen = new Set();
        
        connections.forEach(conn => {
            const key = `${conn.from}->${conn.to}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(conn);
            }
        });
        
        return unique;
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
        // Remove duplicate connections from entire AST
        ast.connections = this.removeDuplicateConnections(ast.connections);

        // Check for orphaned nodes
        const connectedNodes = new Set();
        ast.connections.forEach(conn => {
            connectedNodes.add(conn.from);
            connectedNodes.add(conn.to);
        });
        
        const orphanedNodes = ast.nodes.filter(node => !connectedNodes.has(node.id));
        if (orphanedNodes.length > 0) {
            console.warn('⚠️  Found orphaned nodes:', orphanedNodes.map(n => `${n.type}("${n.value}")`));
        }

        // Check for duplicate node IDs
        const nodeIds = ast.nodes.map(n => n.id);
        const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            throw new Error(`Duplicate node IDs found: ${duplicates.join(', ')}`);
        }
    }
}
