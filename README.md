# CPU - ALU - Cache - RAM Simulation

An interactive, web-based simulator designed to visualize the data flow, operations, and cache replacement policies within a computer system consisting of a CPU, Arithmetic Logic Unit (ALU), Cache Memory, and RAM.

## Features

- **Interactive Operations**: Input two numbers and perform a variety of arithmetic and logical operations:
  - **Arithmetic**: Addition (`ADD`), Subtraction (`SUB`), Multiplication (`MUL`), Division (`DIV`)
  - **Logical**: `AND`, `OR`, `NOT` (unary operation on the first input)
- **Visual Execution Path**: Animated data element showing data transfer between the CPU, ALU, Cache, and RAM.
- **Dynamic RAM Sizing**: Configure RAM memory size on the fly (4, 8, 12, or 16 blocks).
- **Cache Policy Selection**: Choose between standard cache replacement algorithms:
  - **FIFO** (First-In, First-Out)
  - **LRU** (Least Recently Used)
- **Live Status Feed**: Step-by-step logs describing the operation status and Cache Hit/Miss scenarios.

## How to Run

Since the simulator is built with standard web technologies, no installation or compilation is required.

1. Clone or download this repository.
2. Double-click [index.html](file:///C:/Users/narut/OneDrive/Masa%C3%BCst%C3%BC/CPU-ALU-CACHE-RAM-Simulation/index.html) (or open it with any modern web browser).

## How to Use

1. **Configure Parameters**:
   - Enter **1. Sayı** (First Number) and **2. Sayı** (Second Number).
   - Select the desired **ALU Operation**.
   - Select the **RAM Size** (number of blocks).
   - Choose the **Cache Policy** (`FIFO` or `LRU`).
2. **Execute Simulation**:
   - Click the **İşlemi Başlat** (Start Operation) button.
   - Watch the yellow data block travel across the visual pipeline.
   - Observe the **Cache Blocks** and **RAM Blocks** updating color (green for active blocks) and content with the calculation results.
   - Check the **Status Info** box for cache hit/miss notifications.

## Technologies Used

- **HTML5**: For page structure.
- **CSS3**: For custom styling, layout (Flexbox/Grid), neon glow visual aesthetics, and keyframe animations.
- **Vanilla JavaScript**: For the simulation loop, mathematical operations, cache eviction logic, and dynamic DOM updates.
