# Technical Design Document: CPU-ALU-Cache-RAM Simulation

This document provides a detailed overview of the system architecture, component layout, execution flow, and algorithms implemented in the refactored and cleaned up CPU-ALU-Cache-RAM Simulation project.

---

## 1. System Architecture

The simulation models a computer memory hierarchy and instruction execution pipeline. The system consists of four main components connected sequentially on a motherboard dashboard:

```
[ CPU ] <=== Sistem Yolu (SVG Bus) ===> [ ALU ] <===> [ Cache ] <===> [ RAM ]
```

### Dashboard Panels & Components

1. **CPU (Central Processing Unit)**:
   - Initiates operations and manages execution flow state.
   - Val display shows its current state (e.g. IDLE, FETCH, input values).
2. **ALU (Arithmetic Logic Unit)**:
   - Responsible for carrying out arithmetic computations and bitwise operations.
   - Supported operations: `ADD`, `SUB`, `MUL`, `DIV`, `AND`, `OR`, `NOT` (unary on Giriş A).
3. **Cache Memory**:
   - A fast, low-capacity storage area containing a configurable set of blocks (2, 4, 6, 8 blocks).
   - Employs eviction policies (`FIFO` and `LRU`) to manage space.
   - Displays values, slot labels, and eviction metadata (`F0-F7` for FIFO, `L0-L7` for LRU).
4. **RAM (Random Access Memory)**:
   - The primary storage unit representing main memory, configurable dynamically (4, 8, 12, 16 blocks).
   - Serves as the backing store for calculations on Cache Miss.
5. **Live Terminal Console**:
   - Outputs timestamped logs at every cycle step for educational tracking.

---

## 2. Operation Logic & Data Flow

The application isolates manual operations from the automatic background cycle, preventing clashing state updates.

### A. The Automatic Cycle Simulation (Loop)
- Triggered by toggling the "Otomatik Döngü" button.
- Runs a slow-paced visual demo of CPU instruction fetch, decode, lookups, and mock cache refreshes.
- Adjusting the "Döngü Hızı" (Speed Slider) dynamically updates the interval duration.

### B. User-Triggered Operation Flow (Interactive Run)
When a user inputs values, selects an operation, and clicks **"İşlemi Başlat"**:
1. **CPU Preparation**: CPU sets active status.
2. **Bus Transfer**: A yellow data packet moves from CPU to ALU.
3. **ALU Computation**: ALU processes inputs and displays results.
4. **Bus Transfer**: Data packet moves from ALU to Cache.
5. **Cache Verification**:
   - **Cache Hit**: Data is found in active cache slots. Visual highlight on the hit block. LRU tracking order is updated. Operation completes.
   - **Cache Miss**: Cache status sets to Miss. Packet travels to RAM to query.
6. **RAM Query**:
   - **RAM Hit**: Data is found in RAM. Highlight on the RAM block. Data is copied back to Cache.
   - **RAM Miss**: Data is written to an empty RAM block, then loaded into Cache.
7. **Cache Load (Eviction Check)**:
   - The value is loaded into Cache.
   - If Cache is full, eviction policy (FIFO or LRU) triggers to replace a block.

---

## 3. Cache Eviction Algorithms

The front-end implements exact state tracking arrays to match physical hardware architectures:

### FIFO (First-In, First-Out)
- **Concept**: Evicts the block that was loaded earliest.
- **Implementation**: Maintains a queue (`fifoQueue`) of block indices. When a block is loaded, its index is appended. When eviction occurs, index is popped from the front (`shift`), and the new block index is appended to the back.

### LRU (Least Recently Used)
- **Concept**: Evicts the block that has not been accessed for the longest duration of time.
- **Implementation**: Maintains a list (`lruTracker`) of block indices. On every cache write or hit, the accessed block index is moved to the end of the array. When eviction occurs, the index at the front of the array (least recently used) is evicted.

---

## 4. Architectural Improvements (Refactoring Summary)

- **Eliminated TypeErrors**: Re-bound event listeners to a newly implemented dynamic Cache Size dropdown in `index.html`.
- **Responsive Animations**: Replaced static, viewport-rigid CSS keyframes with a dynamic canvas-bounding client calculation using hardware-accelerated CSS `transform: translate(x, y)` relative positions.
- **State Machine Integration**: Added locks (`isManualRunning` and automated timers) to gracefully pause/resume loops.
- **Clean Code Integrity**: Unified duplicate event bindings, consolidated DOMContentLoaded callbacks, and deleted redundant function bodies.
