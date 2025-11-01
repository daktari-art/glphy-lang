# Contributing to Glyph Language (v0.3.0)

We love your input! We want to make contributing to Glyph as easy and transparent as possible. Your contributions help us build a powerful, intuitive visual programming language.

## 🎯 Development Setup

### Prerequisites
- Node.js **18+** (for ES modules and native test runner)
- npm or yarn
- Git

### Local Development
```bash
# Fork and clone the repository
git clone [https://github.com/daktari-art/glyph-lang.git](https://github.com/daktari-art/glyph-lang.git)
cd glyph-lang

# Install dependencies
npm install

# Run the full test suite
npm test

# Start the development REPL
glyph repl

🔧 Pull Request Process
 * Fork the Repository.
 * Create a Feature Branch (git checkout -b feat/my-new-parser-fix).
 * Implement your changes, paying attention to:
   * Type Safety: If modifying the parser or compiler, consider how your change impacts the Type Inference Engine (v0.3.0).
   * Graph Integrity: Ensure new features maintain the Graph Execution Model (e.g., proper dependency mapping in the AST).
   * N-ary Consistency: Confirm that new or modified functions can correctly handle multiple inputs.
 * Write Tests for your changes. All new features require new tests (see the Testing section).
 * Update Documentation (SPECIFICATION.md, README.md, GETTING_STARTED.md) if your changes introduce new syntax or public features.
 * Commit your changes using the Conventional Commits standard.
 * Push your branch and submit a Pull Request.
🏷️ Commit Convention
We use Conventional Commits to automate versioning and changelog generation.
| Prefix | Type | Description |
|---|---|---|
| feat | New features | e.g., feat: implement type annotations for data nodes |
| fix | Bug fixes | e.g., fix: resolve n-ary bug in divide function |
| docs | Documentation changes | e.g., docs: update roadmap for v0.4.0 |
| style | Code style changes (formatting, etc) |  |
| refactor | Code refactoring | e.g., refactor: move function execution to engine-util |
| test | Adding or updating tests |  |
| chore | Maintenance tasks | e.g., chore: update node engine version in package.json |
🧪 Testing
The integrity of Glyph depends on its comprehensive test suite.
Running Tests
# Run all tests (uses test-run.js as entry point)
npm test

# Start development in watch mode
npm run dev

Writing Tests
Please structure your tests using mocha or the native Node.js test runner for simplicity.
// Example Test Structure
import { expect } => 'chai';
import { GlyphCompiler } from '../src/compiler/core.js';
import { GlyphEngine } from '../src/runtime/engine.js';

describe('GlyphEngine v0.3.0', () => {
  it('should correctly handle N-ary subtraction (100 - 10 - 5)', async () => {
    const code = '[○ 100] → [▷ subtract] ← [○ 10] ← [○ 5] → [⤶ print]';
    // ... setup and run engine ...
    expect(result.output[0]).to.include('85'); 
  });
});

🏆 Recognition
All contributors will be recognized in our:
 * GitHub contributors list
 * Release notes (if code-related)
 * Documentation (if significant contribution)
Thank you for contributing to Glyph! 🎉

