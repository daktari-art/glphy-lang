# Getting Started with Glyph

## 🚀 Quick Start

### Installation
```bash
npm install @glyph-lang/core
```

Your First Program

Create hello.glyph:

```glyph
[□ "Hello, World!"] → [⤶ print]
```

Run it:

```bash
npx glyph run hello.glyph
```

📖 Learning Path

Day 1: Basic Data Flow

Learn to create simple data pipelines:

```glyph
# Simple value flow
[○ 42] → [⤶ print]

# Text transformation
[□ "hello"] → [▷ to_upper] → [⤶ print]

# Math operations
[○ 5] → [▷ multiply] ← [○ 6] → [⤶ print]
```

Day 2: Conditional Logic

Learn branching and pattern matching:

```glyph
# Simple condition
[○ age] → [◯ age >= 18] ─true─→ [□ "Adult"]
                       └false─→ [□ "Minor"]

# Pattern matching
factorial:
  [○ 0] → [○ 1]
  [○ n] → [▷ multiply] ← [○ n] ← [▷ factorial] ← [▷ subtract] ← [○ n] ← [○ 1]
```

Day 3: Lists & Loops

Work with collections:

```glyph
# Map operation
[△ [1, 2, 3]] → [▷ map] ← [▷ double] → [△ [2, 4, 6]]

# Filter operation  
[△ users] → [▷ filter] ← [▷ is_active] → [△ active_users]

# Reduce operation
[△ numbers] → [▷ reduce] ← [▷ add] ← [○ 0] → [○ sum]
```

Day 4: Error Handling

Make your programs robust:

```glyph
# Safe division
[○ numerator] → [▷ safe_divide] ← [○ denominator]
    → [◯ is_error?] ─true─→ [⚡ log_error]
                   └false─→ [⤶ use_result]

# Error recovery
[⚡ error] → [▷ recover] → [○ fallback_value]
```

Day 5: Async Operations

Work with external data:

```glyph
# HTTP request
[□ "https://api.example.com/data"] → [🔄 fetch] → [□ response]

# File operations
[□ "data.txt"] → [▷ read_file] → [□ content]

# Multiple async operations
[○ user_id] → [🔄 fetch_profile] → [○ profile]
            → [🔄 fetch_posts] → [○ posts]
```

🛠️ Development Workflow

1. Write Glyph Code

Create files with .glyph extension:

```glyph
# calculator.glyph
add_numbers:
  [○ a] → [▷ add] ← [○ b] → [○ result]

main:
  [○ 5] → [▷ add_numbers] ← [○ 3] → [⤶ print]
```

2. Compile and Run

```bash
# Compile to JavaScript
glyph compile calculator.glyph

# Run directly
glyph run calculator.glyph

# Watch for changes
glyph watch calculator.glyph
```

3. Debug

Use the built-in debugger:

```bash
glyph debug calculator.glyph
```

📝 Common Patterns

Data Transformation Pipeline

```glyph
process_data:
  [○ raw_data] → [▷ validate] → [▷ transform] → [▷ enrich] → [○ processed_data]
```

Error Handling Chain

```glyph
robust_operation:
  [○ input] → [▷ try_operation] → [◯ success?] ─true─→ [⤶ result]
                                   └false─→ [▷ fallback] → [⤶ result]
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

Runtime Error: Node not found

· Verify all referenced nodes are defined
· Check for typos in node names

Type Error: Mismatched data

· Use type validation nodes
· Add explicit type conversions

Getting Help

· Check the examples directory
· Review SPECIFICATION.md
· Open an issue on GitHub
· Join our community Discord

🎯 Next Steps

· Explore the standard library
· Check out advanced examples
· Contribute to the project
· Build your own glyph nodes
