# Technical Design Document: CPU-ALU-Cache-RAM Simulation

This document provides a detailed overview of the system architecture, component layout, execution flow, and algorithms implemented in the CPU-ALU-Cache-RAM Simulation project.

---

## 1. System Architecture

The simulation models a simplified version of a computer memory hierarchy and instruction execution pipeline. The system consists of four main components connected sequentially:

```
[ CPU ] <---> [ ALU ] <---> [ Cache ] <---> [ RAM ]
```

### Components

1. **CPU (Central Processing Unit)**:
   - Acts as the entry point for the user-defined data.
   - Initiates operations and manages execution flow state.
2. **ALU (Arithmetic Logic Unit)**:
   - Responsible for carrying out arithmetic computations and bitwise operations.
   - Supports: `ADD`, `SUB`, `MUL`, `DIV`, `AND`, `OR`, `NOT`.
3. **Cache Memory**:
   - A fast, low-capacity storage area containing a fixed set of blocks (A, B, C, D).
   - Intercepts requests to RAM to reduce data retrieval time.
   - Employs eviction policies (`FIFO` and `LRU`) to manage space.
4. **RAM (Random Access Memory)**:
   - The primary storage unit representing main memory.
   - Dynamically sized based on user selections (4, 8, 12, or 16 blocks).
   - Slow relative to the Cache, acting as the backing store for calculation results.

---

## 2. Operation Logic & Data Flow

The application executes two distinct flows:

### A. The Background Cycle Simulation (Automatic Loop)
A continuous background loop runs via a `setInterval(processCycle, 100)` timer to demonstrate hypothetical data movement step-by-step:
1. **CPU State** (Counter < 30): CPU glows; status updates to "CPU veri gönderiyor...".
2. **ALU State** (Counter 30–59): ALU glows; performs mock operations and updates status.
3. **Cache State** (Counter 60–89): Cache glows; checks cache contents for dummy block 'A'.
4. **RAM State** (Counter 90–119): RAM glows; reads from a dummy RAM block.
5. **Write RAM State** (Counter 120–149): Writes test data to RAM.
6. **Cycle Reset** (Counter >= 150): Loop restarts.

### B. User-Triggered Operation Flow (Interactive Run)
When a user inputs values, selects an operation, and clicks **"İşlemi Başlat"** (Start Operation):
1. **Arithmetic/Logic Calculation**: The selected operation is computed in JavaScript.
2. **Data Animation**: The `#data` element containing the input values is animated along the pipeline path.
3. **Cache Hit Verification**:
   - The system checks if the computed result already exists in the active cache blocks.
   - **Cache Hit**: Operation completes instantly; status displays *"Cache Hit: Veri zaten cache içinde!"*.
   - **Cache Miss**: Status displays *"Cache Miss: RAM'den Cache'e veri yükleniyor..."*.
4. **RAM Fetch / Cache Update**:
   - The system checks if the result exists in RAM.
   - If found in RAM (RAM Hit), the data is copied to the Cache using the selected Cache Policy.
   - If not found in RAM (RAM Miss), the data is written to an empty RAM block first, and then loaded into the Cache.

---

## 3. Cache Eviction Algorithms

When the Cache is full and a Cache Miss occurs, the simulator uses one of two replacement strategies:

### FIFO (First-In, First-Out)
- **Concept**: Evicts the block that was loaded earliest.
- **Simulation Code**: Replaces the first block (`blocks[0]`) when all slots are active.

### LRU (Least Recently Used)
- **Concept**: Evicts the block that has not been accessed for the longest duration of time.
- **Simulation Code**: Evicts the last block (`blocks[blocks.length - 1]`) when all slots are active.

---

## 4. Technical Specifications & Observations

### Stack
- **Frontend**: Vanilla HTML5 and CSS3 (No external styling libraries).
- **Behavioral Logic**: ES6+ Vanilla JavaScript.

### Codebase Observations
During code analysis, we noted the following architecture elements:
- **Redundant Functions**: `script.js` contains multiple definitions of `createRAMBlocks()` and `createCacheBlocks()`.
- **Cache-Size Event Listener**: The script attempts to bind an event listener to `#cache-size`. However, `#cache-size` does not exist in the current `index.html`. This triggers a console TypeError but does not halt the overall program execution due to isolation of click handlers.
