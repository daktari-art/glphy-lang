# Glyph Language Specification v2.0

## 🎯 Core Philosophy
"Clarity through visual data flow" - Programs are graphs where data flows through visual components with multi-input support

## 📐 Fundamental Elements

### Basic Glyphs
- `○` DATA_NODE - Values, variables, constants
- `□` TEXT_NODE - String data  
- `△` LIST_NODE - Collections, arrays
- `◇` BOOL_NODE - Boolean values
- `▷` FUNCTION_NODE - Operations, transformations (supports multiple inputs)
- `⟳` LOOP_NODE - Iteration, repetition
- `◯` CONDITION_NODE - Branching, decisions
- `⤶` OUTPUT_NODE - Results, side effects
- `⚡` ERROR_NODE - Error handling
- `🔄` ASYNC_NODE - Async operations

### Connectors
- `→` DATA_FLOW - Primary data flow (right direction)
- `←` DATA_FLOW - Reverse data flow (left direction)  
- `⚡` ERROR_FLOW - Error propagation  
- `🔄` ASYNC_FLOW - Async data transfer
- `⤴` RETURN_FLOW - Function returns
- `⤵` INPUT_FLOW - External inputs

## 📖 Syntax Rules

### Program Structure
```

[SOURCE] → [PROCESSOR] ← [INPUT] → [DESTINATION]

```

### Multi-Input Functions
```glyph
# Multiple inputs flow into function nodes
[○ a] → [▷ function] ← [○ b] ← [○ c]
# Equivalent to: function(a, b, c)
```

Data Flow Direction

· Left → Right (primary forward flow)
· Right → Left (reverse flow into functions)
· Top → Bottom (secondary organization)

🔧 Core Language Features

Graph-Based Execution

```glyph
# Programs are executed as dependency graphs
[○ 2] → [▷ multiply] ← [○ 3] → [○ result]
[○ 4] → [▷ add] ← [○ result] → [○ final]
```

Multi-Input Support (NEW IN v2.0)

```glyph
# Functions can accept multiple inputs
[○ 5] → [▷ multiply] ← [○ 6] → [○ 30]        # Valid - 5 * 6 = 30
[□ "hello"] → [▷ concat] ← [□ " world"] → [□ "hello world"]  # Valid
```

Immutable Data Flow

```glyph
[○ "hello"] → [▷ to_upper] → [□ "HELLO"]  # Valid - new data created
[○ "hello"] ← [□ "modified"]              # Invalid - no backward mutation
```

🆕 New in v2.0: Advanced Patterns

Pattern Matching with Multi-Input

```glyph
factorial:
  [○ 0] → [○ 1]
  [○ n] → [▷ multiply] ← [○ n] ← [▷ factorial] ← [▷ subtract] ← [○ n] ← [○ 1]
```

Error Handling as Data

```glyph
[○ numerator] → [▷ safe_divide] ← [○ denominator]
    → [◯ is_error?] ─true─→ [⚡ handle_error]
                   └false─→ [⤶ use_result]
```

Complex Data Transformations

```glyph
process_user:
  [○ raw_data] → [▷ validate] → [▷ transform] → [▷ enrich] → [○ processed]
            → [◯ valid?] ─true─→ [⤶ store]
                       └false─→ [⚡ log_error] → [▷ retry] → [process_user]
```

🏗️ Type System

Structural Typing

```glyph
type User = {
  name: String
  age: Int
  email: String?
}

[○ {name: "Alice", age: 30}] → [▷ validate_user] → [◇ valid]
```

Type Inference

```glyph
[○ 42]           # Inferred as Int
[□ "hello"]      # Inferred as String  
[△ [1, 2, 3]]    # Inferred as Array<Int>
[○ true]         # Inferred as Boolean
```

🔧 Execution Model

1. Graph Evaluation (NEW IN v2.0)

· Programs are directed acyclic graphs (DAGs)
· Nodes execute when all inputs are available
· Topological sorting determines execution order
· Parallel execution of independent branches

2. Multi-Input Resolution

```glyph
# Execution order: data nodes first, then function
[○ 2] ──────→ [▷ multiply] → [○ 6]
[○ 3] ──────→ 
```

3. Lazy Evaluation

```glyph
[○ 5] → [▷ expensive_calc] → [◯ need_result?] ─true─→ [⤶ use_it]
                                              └false─→ [⤶ skip]
```

4. Parallel Execution

```glyph
[○ input] → [▷ process_a] → [○ result_a]
           → [▷ process_b] → [○ result_b]
           → [▷ process_c] → [○ result_c]
```

📚 Standard Library (v2.0)

Math Operations

```glyph
# Multi-input math functions
[○ a] → [╋ add] ← [○ b] ← [○ c]              # a + b + c
[○ a] → [⊖ subtract] ← [○ b]                 # a - b
[○ base] → [▷ exponent] ← [○ power]          # base^power
[○ a] → [▷ multiply] ← [○ b] ← [○ c]         # a * b * c
```

Text Operations

```glyph
[□ text] → [▷ to_upper] → [□ TEXT]
[□ text] → [▷ to_lower] → [□ text]
[□ text] → [▷ concat] ← [□ text2] → [□ combined]
[□ text] → [▷ length] → [○ number]
```

Type Conversion

```glyph
[○ value] → [▷ to_string] → [□ string]
[○ value] → [▷ to_number] → [○ number]
[□ text] → [▷ parse_text_to_number] → [○ number]  # "twenty" → 20
[□ text] → [▷ clean_mixed_input] → [○ number]     # "25 years" → 25
```

List Operations (Partial)

```glyph
[△ list] → [▷ map] ← [▷ transformer] → [△ new_list]
[△ list] → [▷ filter] ← [▷ predicate] → [△ filtered]
```

Validation

```glyph
[○ value] → [▷ is_valid_age] → [◇ boolean]
[○ value] → [▷ extract_number] → [○ number]  # Extract from mixed text
```

I/O Operations

```glyph
# Console
[○ data] → [⤶ print]
[⤵ input] → [○ user_input]

# Files
[□ filename] → [▷ read_file] → [□ content]

# HTTP
[□ url] → [🔄 fetch] → [□ response]
```

🆕 v2.0 Breaking Changes

Multi-Input Semantics

Before (v1.0):

```glyph
[○ 2] → [▷ multiply] ← [○ 3] → [▷ print]
# Result: multiply got [2], print got [3] ❌
```

After (v2.0):

```glyph
[○ 2] → [▷ multiply] ← [○ 3] → [▷ print]  
# Result: multiply gets [2, 3] → 6 → print ✅
```

Connection Parsing

· Left arrows (←) now create reverse connections
· Graph-based parsing replaces linear flow
· Multiple connections to single node supported

🎯 Migration Guide

Updating v1.0 Code to v2.0

Before:

```glyph
# This didn't work as expected in v1.0
[○ 5] → [▷ multiply] ← [○ 6] → [▷ print]
```

After:

```glyph
# Same code now works perfectly in v2.0!
[○ 5] → [▷ multiply] ← [○ 6] → [▷ print]
# Output: 📤 PRINT: 30
```

New Recommended Patterns

```glyph
# Use multiple inputs naturally
[○ x] → [▷ operation] ← [○ y] ← [○ z]

# Complex flows with clear data direction
[○ input] → [▷ step1] → [▷ step2] ← [○ config] → [○ result]
```

---

Glyph Language v2.0 represents a major evolution in visual data flow programming with robust multi-input support and graph-based execution! 🚀

```

**Key updates in this specification:**
- ✅ Updated to v2.0 reflecting multi-input breakthrough
- ✅ Clear documentation of graph-based execution model
- ✅ Comprehensive standard library documentation
- ✅ Migration guide from v1.0 to v2.0
- ✅ Enhanced examples showing multi-input patterns
