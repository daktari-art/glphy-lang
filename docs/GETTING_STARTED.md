# Getting Started with Glyph Language v0.3.0

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g @glyph-lang/core

# Verify installation
glyph --version
# Output: 🔮 Glyph Language v0.3.0

Your First Program
Glyph programs are simple graphs of data flow.
Create hello.glyph:
# [Glyph_Type value: optional_type_annotation] → [Connector] → [Destination]
[□ "Hello, Glyph World!"] → [▷ print] 

Run it:
glyph run hello.glyph
# Output: 📤 PRINT: Hello, Glyph World!

📖 Learning Path: Core Concepts
Day 1: Data Flow and N-ary Operations
Learn to create simple data pipelines and use functions that accept multiple inputs.
| Concept | Glyph Code | Description |
|---|---|---|
| Data Types | [○ 42: number]
[□ "text": string]
[◇ true: boolean] | Data nodes (○, □, ◇) with optional v0.3.0 Type Annotations. |
| Simple Flow | [○ 42] → [⤶ print] | A single value flows directly to an Output node. |
| Chained Math (v0.3.0 Fix) | [○ 100] → [▷ subtract] ← [○ 10] ← [○ 5] → [▷ print] | The function is called as subtract(100, 10, 5), resulting in 85. |
| Text Pipeline | [□ " hello "] → [▷ trim] → [▷ to_upper] → [⤶ print] | Data flows sequentially through transformations. |
Day 2: Functions, Scopes, and Recursion (v0.3.0)
With v0.3.0, you can now define and call your own functions, enabling complex, recursive logic.
 * Define a Function Block: Use a label (fibonacci:) to define a reusable block of logic.
 * Use Function Nodes: Use the ▷ glyph with the label name ([▷ fibonacci]) to call the function.
Example: Calling a Function
To run a recursive program like fibonacci.glyph:
glyph run examples/fibonacci.glyph
# This program will calculate the 10th Fibonacci number using a scoped, recursive function.

Day 3: Error Flow (⚡) Routing
The ⚡ connector allows you to redirect program flow when an error is encountered.
| Connector | Function |
|---|---|
| → | Primary Data Flow (Success) |
| ⚡ | Error Flow (Failure, v0.3.0) |
Example of Error Handling (Conceptual)
[□ "file_DNE.txt"] → [▷ read_file] ⚡ [▷ print]
# If read_file fails, the error message itself flows to the print node.

🛠️ Tooling & Troubleshooting
Interactive REPL
The fastest way to test small pieces of Glyph code.
glyph repl
glyph> [○ 1] → [▷ add] ← [○ 2] ← [○ 3] → [▷ multiply] ← [○ 10] → [▷ print]
# Output: 📤 PRINT: 60
=> 60

Troubleshooting Tips
| Issue | Cause | Solution |
|---|---|---|
| "Unknown function" | You misspelled a built-in function name (e.g., multipy). | Check the list in SPECIFICATION.md. |
| Incorrect Math Result | You forgot to connect all inputs to the function node. | Verify all inputs are connected to the ▷ node. |
| "Type Error" | You connected a string to an operation expecting a number (e.g., [□ "five"] → [▷ multiply]). | Use a type annotation or a conversion function like [▷ to_number]. |
🎯 Next Steps
 * Explore Examples: Run all examples in the examples/ directory (glyph run examples/arithmetic.glyph).
 * Read Specification: Understand the full grammar and built-in functions in SPECIFICATION.md.
 * Join Development: Check CONTRIBUTING.md for how to help build v0.4.0 (Async/External Packages)!

