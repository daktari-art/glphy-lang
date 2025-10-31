# 🔮 Glyph Language

> **Visual Data Flow Programming Language** - Where programs are graphs and data flows through visual components

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.3.0-green)](https://github.com/daktari-art/glyph-lang)

Glyph is a revolutionary visual data flow programming language that makes complex data transformations intuitive through graph-based execution.

## 🚀 What's New in v0.3.0

- **🛡️ Type Inference Engine** - Static analysis to detect type mismatches before runtime.
- **🔗 Scoped Functions & Call Stack** - Full support for recursion and modular program design (e.g., `fibonacci.glyph` now works).
- **💥 Error Flow (⚡) Routing** - Graceful error handling via the error flow connector.
- **✅ N-ary Arithmetic Fix** - `subtract` and `divide` now correctly handle multiple inputs as chained operations.
- **🎯 Graph-Based Parser** - No more linear flow limitations! (from v0.2.0)

## ⚡ Quick Start

```bash
# Install globally
npm install -g @glyph-lang/core

# Create your first program
echo '[○ 5: number] → [▷ multiply] ← [○ 6: number] → [▷ print]' > multiply.glyph

# Run it!
glyph run multiply.glyph
# Output: 📤 PRINT: 30

📖 Examples
🔢 Arithmetic Operations
# Chained multiplication (N-ary fix in v0.3.0)
[○ 3] → [▷ multiply] ← [○ 4] ← [○ 2] → [▷ print]  # Output: 24

# N-ary Subtraction (Chained Operation)
[○ 100] → [▷ subtract] ← [○ 10] ← [○ 5] → [▷ print]  # Output: 85 (100 - 10 - 5)

✍️ Text Processing
[□ " hello world "] → [▷ trim] → [▷ to_upper] → [▷ print]  # Output: HELLO WORLD

🚀 Scoped Function (Recursion)
# Calling a user-defined function block
[○ 10] → [▷ fibonacci] → [⤶ print]

🏗️ Architecture
Glyph Source → Type Inference → Graph Parser → AST → Execution Engine → Results
     │               │              │           │          │
    .glyph      Static Typing   Multi-input  Dependency  Parallel
    files      & Validation  connections   graph      execution

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
# See all examples in action
glyph run examples/arithmetic.glyph
glyph run examples/fibonacci.glyph
glyph run examples/hello-world.glyph

🤝 Contributing
We welcome contributions! Please see our Contributing Guide for details.
Development Setup
git clone [https://github.com/daktari-art/glyph-lang.git](https://github.com/daktari-art/glyph-lang.git)
cd glyph-lang
npm install
npm test  # Run test suite
glyph repl  # Start development REPL

📄 License
MIT License - see LICENSE for details.
Ready to transform how you think about programming? Get Started Now!

