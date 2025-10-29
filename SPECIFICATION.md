# Glyph Language Specification v1.0

## 🎯 Core Philosophy
"Clarity through visual data flow" - Programs are graphs where data flows through visual components

## 📐 Fundamental Elements

### Basic Glyphs
- `○` DATA_NODE - Values, variables, constants
- `□` TEXT_NODE - String data  
- `△` LIST_NODE - Collections, arrays
- `◇` BOOL_NODE - Boolean values
- `▷` FUNCTION_NODE - Operations, transformations
- `⟳` LOOP_NODE - Iteration, repetition
- `◯` CONDITION_NODE - Branching, decisions
- `⤶` OUTPUT_NODE - Results, side effects
- `⚡` ERROR_NODE - Error handling
- `🔄` ASYNC_NODE - Async operations

### Connectors
- `→` DATA_FLOW - Primary data flow
- `⚡` ERROR_FLOW - Error propagation  
- `🔄` ASYNC_FLOW - Async data transfer
- `⤴` RETURN_FLOW - Function returns
- `⤵` INPUT_FLOW - External inputs

## 📖 Syntax Rules

### Program Structure
```

[SOURCE] → [PROCESSOR] → [DESTINATION]

```

### Data Flow Direction
- Left → Right (primary)
- Top → Bottom (secondary)

## 🔧 Core Language Features

### Immutable Data Flow
```glyph
[○ "hello"] → [▷ to_upper] → [□ "HELLO"]  # Valid
[○ "hello"] ← [□ "modified"]              # Invalid - no backward flow
```

Pattern Matching

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
```

🔧 Execution Model

1. Graph Evaluation

· Programs are directed acyclic graphs (DAGs)
· Nodes execute when all inputs are available
· Data flows through connections

2. Lazy Evaluation

```glyph
[○ 5] → [▷ expensive_calc] → [◯ need_result?] ─true─→ [⤶ use_it]
                                              └false─→ [⤶ skip]
```

3. Parallel Execution

```glyph
[○ input] → [▷ process_a] → [○ result_a]
           → [▷ process_b] → [○ result_b]
           → [▷ process_c] → [○ result_c]
```

📚 Standard Library

Data Operations

```glyph
# Math
[○ a] → [╋ add] ← [○ b]
[○ a] → [⊖ subtract] ← [○ b] 

# Text
[□ text] → [▷ to_upper] → [□ TEXT]
[□ text] → [▷ split] ← [□ delimiter] → [△ parts]

# Lists
[△ list] → [▷ map] ← [▷ transformer] → [△ new_list]
[△ list] → [▷ filter] ← [▷ predicate] → [△ filtered]
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
