# 🔮 Glyph Language

> Visual Data Flow Programming Language

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Glyph is a visual data flow programming language where programs are graphs and data flows through visual components.

## 🎯 Quick Start

```bash
# Install
npm install @glyph-lang/core

# Create your first program
echo '[□ "Hello, World!"] → [⤶ print]' > hello.glyph

# Run it
npx glyph run hello.glyph
```

📖 Examples

Hello World

```glyph
[□ "Hello, World!"] → [⤶ print]
```

Fibonacci Sequence

```glyph
fibonacci:
  [○ n] → [◯ n < 2] ─true─→ [○ 1]
                    └false─→ [▷ add] ← [▷ fibonacci] ← [▷ subtract] ← [○ n] ← [○ 1]
```

🚀 Features

· Visual Data Flow: Programs are visual graphs
· Immutable Data: Once created, data cannot be modified
· Error Handling as Data: Errors flow through the graph like regular data
· Type Inference: No explicit types needed
· Parallel Execution: Independent branches run concurrently

📚 Documentation

· Language Specification
· Getting Started
· Examples

🤝 Contributing

We welcome contributions! Please see CONTRIBUTING.md for details.

📄 License

MIT License - see LICENSE for details.
======END FILE ======

`
