# Glyph Language Specification v3.0

## 🎯 Core Philosophy
"Clarity through visual data flow" - Programs are graphs where data flows through visual components with multi-input support.

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
- `⚡` ERROR_NODE - Error handling and routing
- `🔄` ASYNC_NODE - Async operations (e.g., fetch, file I/O)

### Connectors
- `→` DATA_FLOW - Primary data flow (right direction)
- `←` DATA_FLOW - Reverse data flow (left direction)  
- `⚡` ERROR_FLOW - **Error propagation (new in v3.0)** - Used to route caught errors.
- `🔄` ASYNC_FLOW - Async data transfer
- `⤴` RETURN_FLOW - **Function returns (new in v3.0)** - Used to exit a function block.
- `⤵` INPUT_FLOW - External inputs (e.g., CLI arguments)

## 📖 Syntax Rules

### Program Structure
Programs are composed of named blocks (or functions). The default entry point is the `main:` block.


[LABEL]:
[SOURCE] → [PROCESSOR] ← [INPUT] → [DESTINATION]

### Type Annotations (New in v3.0)
Data nodes can now be annotated to aid the static **Type Inference Engine** and improve code clarity.

```glyph
# Syntax: [Glyph_Type value: type_name]
[○ 42: number] → [▷ multiply] ← [○ 10: number]
[□ "hello": string] → [▷ print]
[△ [1, 2, 3]: list<number>] → [▷ map_sum]

Multi-Input Functions
All FUNCTION_NODEs (▷) accept an arbitrary number of inputs, which are collected into a list for execution.
[○ a] → [▷ function] ← [○ b] ← [○ c]
# Equivalent to: function([a, b, c])

Scoped Functions and Control Flow (New in v3.0)
Execution uses a Call Stack to manage function calls and recursion. A function is defined by a label and must exit using a RETURN_FLOW (⤴).
# Function Definition (Block)
calculate_area:
  [○ length: number] → [▷ multiply] ← [○ width: number] → [⤴ return_value]

# Function Call
[○ 5] → [▷ calculate_area] ← [○ 10] → [⤶ output]

Error Handling (New in v3.0)
Errors thrown by a function can be gracefully caught and routed by the ERROR_FLOW (⚡).
# If read_file fails, the error data (e.g., "File Not Found") is routed to the print node.
[□ "missing.txt"] → [▷ read_file] ⚡ [▷ print] 

📜 Built-in Functions (Standard Library)
Core
 * print: Outputs data to console (⤶ print).
Math (All N-ary in v3.0)
 * add: Sums all inputs.
 * multiply: Multiplies all inputs.
 * subtract: Subtracts all inputs from the first input (e.g., [a, b, c] -> a - b - c).
 * divide: Divides the first input by all subsequent inputs (e.g., [a, b, c] -> a / b / c).
Text
 * concat: Joins all inputs (coercing non-strings).
 * to_upper, to_lower, trim, length.
Type Conversion
 * to_number, to_string, to_boolean.
🆕 v3.0 Breaking Changes
N-ary Arithmetic Consistency
 * subtract and divide now treat all connections as arguments in a chained operation, instead of just using the first two. This ensures consistency with add and multiply.
Scoping and Recursion
 * Support for function calls ([▷ function_name]) and return flow (⤴) is now mandatory for creating reusable code blocks.
Type Annotations
 * While optional, type annotations are now part of the syntax and will be enforced by the Type Inference Engine (v0.3.0).

