# 🔮 Glyph Language

> **Visual Data Flow Programming Language** - Where programs are graphs and data flows through visual components

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.3.0-brightgreen)](https://github.com/daktari-art/glyph-lang)

Glyph is a revolutionary visual data flow programming language that makes complex data transformations intuitive through graph-based execution.

## 🚀 What's New in v0.3.0

The focus of v0.3.0 is **Execution Integrity** and **Type Readiness**.

- **✅ N-ary Arithmetic Fix:** Critical bug fix! Operations like `subtract` and `divide` now correctly handle multiple inputs as chained operations (e.g., `100 - 10 - 5 = 85`).
- **🛡️ Type Annotations:** You can now add optional type annotations (e.g., `[○ 42: number]`) for better clarity and future **Type Inference** support.
- **🔄 Scoped Function Foundation:** Core engine stubs are in place to support **recursion** and user-defined function blocks (e.g., `fibonacci.glyph` example).
- **⚡ Error Flow (Stub):** Parser support for the `⚡` connector to route errors visually.

## ⚡ Quick Start

```bash
# Install globally
npm install -g @glyph-lang/core

# Create your first program with a type annotation
echo '[○ 5: number] → [▷ multiply] ← [○ 6: number] → [▷ print]' > multiply.glyph

# Run it!
glyph run multiply.glyph
# Output: 📤 PRINT: 30

📖 Examples
🔢 N-ary Arithmetic Operations (v0.3.0 Critical Test)
# Correctly calculates 100 - 10 - 5 = 85
[○ 100: number] → [▷ subtract] ← [○ 10: number] ← [○ 5: number] → [▷ print]

🔁 Recursive Function Call (Scoped Logic Stub)
# Main entry point to call the 'fibonacci' function
[○ 10: number] → [▷ fibonacci] → [⤶ print]

💡 Error Flow Routing (Future v0.4.0)
# If read_file fails, the flow is redirected to handle the error
[□ "file.txt"] → [▷ read_file] ─true─→ [○ result]
                                └⚡─→ [⚡ error_handler]

🏗️ Architecture
Glyph Source → Graph Parser → AST (with Types) → Execution Engine → Results
     │              │               │                 │
    .glyph     Stable Node ID   Type Annotation    N-ary Fixed
    files     Function Labels  Dependency Graph  Scoped Execution

📚 Documentation
 * Language Specification - Complete language reference
 * Getting Started - Beginner's guide
 * Examples Directory - Ready-to-run programs
 * Contributing Guide - How to contribute
 * Development Roadmap - Future plans
🎮 Try It Now!
Interactive REPL
glyph repl
glyph> [○ 7] → [▷ multiply] ← [○ 8] → [▷ print]
📤 PRINT: 56
=> 56

Run Examples
# See all examples in action, testing the N-ary fixes
glyph run examples/arithmetic.glyph
glyph run examples/fibonacci.glyph

🤝 Contributing
We welcome contributions! Please see our Contributing Guide for details.
Development Setup
git clone [https://github.com/daktari-art/glyph-lang.git](https://github.com/daktari-art/glyph-lang.git)
cd glyph-lang
npm test  # Run v0.3.0 test suite (verifying N-ary fixes)
glyph repl  # Start development REPL

📄 License
MIT License - see LICENSE for details.
Ready to transform how you think about programming? Get Started Now!

