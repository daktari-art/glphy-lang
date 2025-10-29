# Contributing to Glyph Language

We love your input! We want to make contributing to Glyph as easy and transparent as possible.

## 🎯 Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Local Development
```bash
# Fork and clone the repository
git clone https://github.com/your-username/glyph-lang.git
cd glyph-lang

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

🐛 Reporting Bugs

Before Submitting a Bug Report

· Check the existing issues
· Ensure you're using the latest version
· Reproduce the issue with the latest code

Bug Report Template

```
**Description**
A clear and concise description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Write this glyph code...
2. Run this command...
3. See error...

**Expected Behavior**
What you expected to happen.

**Environment:**
 - OS: [e.g. Windows, macOS, Linux]
 - Node Version: [e.g. 16.14.0]
 - Glyph Version: [e.g. 0.1.0]

**Additional Context**
Add any other context about the problem here.
```

💡 Suggesting Enhancements

Enhancement Request Template

```
**Problem Statement**
What problem are you trying to solve?

**Proposed Solution**
How should this work?

**Alternative Solutions**
Other ways to solve this problem.

**Additional Context**
Links, references, examples, etc.
```

🔧 Pull Request Process

1. Fork the Repository
2. Create a Feature Branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Follow Code Style
   · Use 2-space indentation
   · Write descriptive commit messages
   · Add tests for new functionality
4. Update Documentation if needed
5. Run Tests
   ```bash
   npm test
   ```
6. Submit Pull Request

PR Template

```
## Description
What does this PR do?

## Related Issues
Fixes # (issue number)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Added unit tests
- [ ] Tested manually
- [ ] All tests pass

## Documentation
- [ ] Updated SPECIFICATION.md if needed
- [ ] Updated README.md if needed
- [ ] Added code comments
```

🏷️ Commit Convention

We use Conventional Commits:

· feat: New features
· fix: Bug fixes
· docs: Documentation changes
· style: Code style changes (formatting, etc)
· refactor: Code refactoring
· test: Adding or updating tests
· chore: Maintenance tasks

Examples:

```
feat: add pattern matching support
fix: resolve parser infinite loop
docs: update getting started guide
```

🧪 Testing

Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx mocha tests/compiler.test.js
```

Writing Tests

```javascript
import { expect } from 'chai';
import { GlyphCompiler } from '../src/compiler/core.js';

describe('GlyphCompiler', () => {
  it('should parse basic data node', () => {
    const compiler = new GlyphCompiler();
    const ast = compiler.parse('[○ 42]');
    expect(ast.body[0].type).to.equal('DATA_NODE');
  });
});
```

📚 Documentation

We value good documentation! Please update:

· SPECIFICATION.md for language changes
· README.md for user-facing features
· Code comments for complex logic

🏆 Recognition

All contributors will be recognized in our:

· GitHub contributors list
· Release notes
· Documentation (if significant contribution)

❓ Questions?

· Open an issue for bug reports and feature requests
· Check existing documentation before asking

Thank you for contributing to Glyph! 🎉
