# Getting Started with Glyph Language v2.0

## 🚀 Quick Start

### Installation
```bash
# Install globally
npm install -g @glyph-lang/core

# Or use directly with npx
npx @glyph-lang/core run examples/hello-world.glyph
```

Your First Program

Create hello.glyph:

```glyph
[□ "Hello, World!"] → [▷ print]
```

Run it:

```bash
glyph run hello.glyph
# Output: 📤 PRINT: Hello, World!
```

🆕 What's New in v2.0

Multi-Input Functions Now Work!

```glyph
# This now works perfectly!
[○ 5] → [▷ multiply] ← [○ 6] → [▷ print]
# Output: 📤 PRINT: 30
```

Interactive REPL

```bash
glyph repl
glyph> [○ 7] → [▷ multiply] ← [○ 8] → [▷ print]
📤 PRINT: 56
=> 56
```

📖 Learning Path

Day 1: Basic Data Flow

Learn to create simple data pipelines:

```glyph
# Simple value flow
[○ 42] → [⤶ print]

# Text transformation  
[□ "hello"] → [▷ to_upper] → [⤶ print]

# Multi-input math operations (NEW!)
[○ 5] → [▷ multiply] ← [○ 6] → [⤶ print]
[○ 10] → [▷ add] ← [○ 20] → [⤶ print]
```

Day 2: Complex Data Flow

Work with multiple inputs and complex transformations:

```glyph
# Multiple inputs to functions
[○ 2] → [▷ exponent] ← [○ 8] → [⤶ print]          # 256
[□ "hello"] → [▷ concat] ← [□ " world"] → [⤶ print] # hello world

# Chained operations
[○ 5] → [▷ multiply] ← [○ 6] → [▷ add] ← [○ 10] → [⤶ print]  # 40
```

Day 3: Text Processing & User Input

Handle real-world input scenarios:

```glyph
# Natural language number parsing
[□ "twenty five"] → [▷ parse_text_to_number] → [⤶ print]    # 25
[□ "18 years old"] → [▷ clean_mixed_input] → [⤶ print]      # 18
[□ "one hundred"] → [▷ parse_text_to_number] → [⤶ print]    # 100

# Text transformations
[□ "Hello World"] → [▷ to_lower] → [▷ concat] ← [□ "!"] → [⤶ print]  # hello world!
```

Day 4: Type Conversion & Validation

Ensure data quality and handle different formats:

```glyph
# Type safety
[○ "42"] → [▷ to_number] → [⤶ print]              # 42 (as number)
[○ 123] → [▷ to_string] → [▷ concat] ← [□ " users"] → [⤶ print]  # "123 users"

# Data validation
[○ 25] → [▷ is_valid_age] → [⤶ print]             # true
[○ 150] → [▷ is_valid_age] → [⤶ print]            # false
```

Day 5: Advanced Patterns

Build complex data processing pipelines:

```glyph
# Complex user input processing
process_age_input:
  [○ raw_input] → [▷ parse_text_to_number] → [◯ valid?] ─true─→ [○ age]
                   └false─→ [▷ clean_mixed_input] → [◯ valid?] ─true─→ [○ age]
                                          └false─→ [⚡ "Invalid input"]
```

🛠️ Development Workflow

1. Write Glyph Code

Create files with .glyph extension:

```glyph
# calculator.glyph
add_numbers:
  [○ a] → [▷ add] ← [○ b] → [○ result]

multiply_numbers:
  [○ a] → [▷ multiply] ← [○ b] → [○ result]

main:
  [○ 5] → [▷ add_numbers] ← [○ 3] → [▷ multiply_numbers] ← [○ 2] → [⤶ print]
```

2. Test with REPL

```bash
glyph repl
glyph> [○ 5] → [▷ add] ← [○ 3] → [▷ multiply] ← [○ 2] → [▷ print]
📤 PRINT: 16
=> 16
```

3. Run Your Program

```bash
# Run directly
glyph run calculator.glyph

# Parse and inspect AST
glyph parse calculator.glyph

# Compile to JavaScript
glyph compile calculator.glyph
```

4. Debug and Refine

```bash
# Run tests
glyph test

# Check specific examples
glyph run examples/arithmetic.glyph
```

📝 Common Patterns

Data Transformation Pipeline

```glyph
process_data:
  [○ raw_data] → [▷ validate] → [▷ transform] → [▷ enrich] → [○ processed_data]
```

Multi-Input Processing

```glyph
calculate_total:
  [○ price] → [▷ multiply] ← [○ quantity] → [▷ add] ← [○ tax] → [○ total]
```

User Input Handling

```glyph
handle_user_input:
  [○ input] → [▷ parse_text_to_number] → [◯ valid?] ─true─→ [○ number]
                   └false─→ [▷ clean_mixed_input] → [◯ valid?] ─true─→ [○ number]
                                          └false─→ [⚡ "Please enter a valid number"]
```

Parallel Processing

```glyph
parallel_tasks:
  [○ input] → [▷ task_a] → [○ result_a]
            → [▷ task_b] → [○ result_b]
            → [▷ task_c] → [○ result_c]
```

🔧 Troubleshooting

Common Issues

Parser Error: Unexpected token

· Check for missing brackets []
· Ensure proper glyph symbols are used
· Verify arrow directions (→, ←)

Runtime Error: Function not found

· Verify function name spelling
· Check available functions in standard library
· Use glyph repl to test functions

Multi-Input Not Working

· Ensure you're using v2.0+
· Check arrow directions point toward function
· Verify all inputs are connected

Type Conversion Issues

· Use ▷ to_number for string-to-number conversion
· Use ▷ to_string for number-to-string conversion
· Validate inputs with appropriate functions

Getting Help

1. Check Examples: examples/ directory has working code
2. Use REPL: Test small pieces with glyph repl
3. Read Documentation: SPECIFICATION.md for language details
4. Run Tests: glyph test to verify installation
5. Community: GitHub issues for bug reports

🎯 Next Steps

· Explore Examples: Run all examples in examples/ directory
· Read Specification: Understand language fundamentals in SPECIFICATION.md
· Join Development: Check CONTRIBUTING.md for how to help
· Build Something: Create your own Glyph programs!
· Share Feedback: Let us know what you think!

🆕 Try These v2.0 Examples

```glyph
# Multi-input math
[○ 3] → [▷ multiply] ← [○ 4] → [▷ multiply] ← [○ 5] → [▷ print]  # 60

# Text processing pipeline
[□ " hello world "] → [▷ trim] → [▷ to_upper] → [▷ concat] ← [□ "!"] → [▷ print]  # HELLO WORLD!

# Natural language processing  
[□ "I have twenty five apples"] → [▷ extract_number] → [▷ print]  # 25
```

---

Ready to experience the future of visual programming? Start building with Glyph v2.0 today! 🚀

```

**Key improvements in this guide:**
- ✅ Updated for v2.0 with multi-input examples
- ✅ Clear 5-day learning path with practical examples
- ✅ Enhanced troubleshooting section
- ✅ Modern development workflow with REPL
- ✅ Real-world patterns for data processing
