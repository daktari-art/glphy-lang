# 🔮 Glyph Language

> **Visual Data Flow Programming Language** - Where programs are graphs and data flows through visual components

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.2.0-orange)](https://github.com/daktari-art/glyph-lang)

Glyph is a revolutionary visual data flow programming language that makes complex data transformations intuitive through graph-based execution.

## 🚀 What's New in v0.2.0

- **🎯 Graph-Based Parser** - No more linear flow limitations!
- **🔄 Multi-Input Functions** - `[○ 2] → [▷ multiply] ← [○ 3]` now works correctly!
- **🧠 Smart Execution Engine** - Topological sorting and dependency resolution
- **💪 20+ Built-in Functions** - Math, text, type conversion, and more
- **🖥️ Interactive REPL** - Test Glyph code in real-time
- **📊 Comprehensive Test Suite** - 100% test coverage for core features

## ⚡ Quick Start

```bash
# Install globally
npm install -g @glyph-lang/core

# Create your first program
echo '[○ 5] → [▷ multiply] ← [○ 6] → [▷ print]' > multiply.glyph

# Run it!
glyph run multiply.glyph
# Output: 📤 PRINT: 30
```

📖 Examples

🔢 Arithmetic Operations

```glyph
# Multi-input functions now work perfectly!
[○ 12] → [▷ multiply] ← [○ 12] → [▷ print]          # 144
[○ 2] → [▷ exponent] ← [○ 8] → [▷ print]            # 256
[○ 10] → [▷ add] ← [○ 20] → [▷ subtract] ← [○ 5] → [▷ print]  # 25
```

🔤 Text Processing

```glyph
[□ "hello"] → [▷ to_upper] → [▷ print]              # HELLO
[□ "hello"] → [▷ concat] ← [□ " world"] → [▷ print] # hello world
```

👤 User Input Handling

```glyph
# Process natural language numbers
[□ "twenty five"] → [▷ parse_text_to_number] → [▷ print]      # 25
[□ "18 years old"] → [▷ clean_mixed_input] → [▷ print]        # 18
```

🛠️ CLI Commands

```bash
# Execute a Glyph program
glyph run examples/arithmetic.glyph

# Parse and show AST
glyph parse examples/hello-world.glyph

# Compile to JavaScript
glyph compile examples/user-input.glyph

# Start interactive REPL
glyph repl

# Run test suite
glyph test

# Show version
glyph --version
```

🎯 Key Features

🕸️ Visual Data Flow

Programs are directed graphs where data flows between nodes:

```glyph
[○ data] → [▷ transform] → [◯ condition] ─true─→ [⤶ output]
                              └false─→ [⚡ error]
```

🔄 Immutable Data

Data flows forward - once created, it cannot be modified:

```glyph
[○ 5] → [▷ add] ← [○ 3] → [○ 8]  # New data created, original 5 preserved
```

🧩 Multi-Input Functions

Functions can accept multiple inputs naturally:

```glyph
[○ base] → [▷ exponent] ← [○ power] → [○ result]
[□ first] → [▷ concat] ← [□ second] → [□ combined]
```

🛡️ Error Handling as Data

Errors flow through the graph like regular data:

```glyph
[○ input] → [▷ risky_operation] → [◯ success?] ─true─→ [○ result]
                                      └false─→ [⚡ error_data]
```

🏗️ Architecture

```
Glyph Source → Graph Parser → AST → Execution Engine → Results
     │              │           │          │
     .glyph     Multi-input  Dependency  Parallel
     files     connections   graph      execution
```

📚 Documentation

· Language Specification - Complete language reference
· Getting Started - Beginner's guide
· Examples Directory - Ready-to-run programs
· Contributing Guide - How to contribute
· Development Roadmap - Future plans

🎮 Try It Now!

Interactive REPL

```bash
glyph repl
glyph> [○ 7] → [▷ multiply] ← [○ 8] → [▷ print]
📤 PRINT: 56
=> 56
```

Run Examples

```bash
# See all examples in action
glyph run examples/arithmetic.glyph
glyph run examples/user-input.glyph
glyph run examples/hello-world.glyph
```

🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.

Development Setup

```bash
git clone https://github.com/daktari-art/glyph-lang.git
cd glyph-lang
npm test  # Run test suite
glyph repl  # Start development REPL
```

📄 License

MIT License - see LICENSE for details.

---

Ready to transform how you think about programming? Get Started Now!

```
