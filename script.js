/**
 * CPU-ALU-CACHE-RAM Simulation Logic
 * Clean, modular, and optimized version.
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const input1El = document.getElementById('input1');
  const input2El = document.getElementById('input2');
  const operationSelect = document.getElementById('operation');
  const cacheSizeSelect = document.getElementById('cache-size');
  const ramSizeSelect = document.getElementById('ram-size');
  const policySelect = document.getElementById('cache-policy');
  
  const startBtn = document.getElementById('start-btn');
  const autoBtn = document.getElementById('auto-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  const speedRange = document.getElementById('speed-range');
  const speedVal = document.getElementById('speed-val');
  
  const motherboard = document.getElementById('motherboard');
  const dataPacket = document.getElementById('data-packet');
  
  const cpuEl = document.getElementById('cpu');
  const aluEl = document.getElementById('alu');
  const cacheEl = document.getElementById('cache');
  const ramEl = document.getElementById('ram');
  
  const cpuVal = document.getElementById('cpu-val');
  const aluVal = document.getElementById('alu-val');
  const cacheVal = document.getElementById('cache-val');
  const ramVal = document.getElementById('ram-val');
  
  const cacheBlocksContainer = document.getElementById('cache-blocks');
  const ramBlocksContainer = document.getElementById('ram-blocks');
  const consoleBody = document.getElementById('console-body');
  const consoleClear = document.getElementById('console-clear');
  
  const cachePolicyBadge = document.getElementById('cache-policy-badge');
  const ramSizeBadge = document.getElementById('ram-size-badge');

  // SVG Lines
  const pulseCpuAlu = document.getElementById('pulse-cpu-alu');
  const pulseAluCache = document.getElementById('pulse-alu-cache');
  const pulseCacheRam = document.getElementById('pulse-cache-ram');

  // --- Simulation State ---
  let isAutoMode = false;
  let autoTimer = null;
  let autoStep = 0;
  let speed = parseInt(speedRange.value);
  let isManualRunning = false;

  // Cache & RAM Memory Storage Structures
  let cacheSize = parseInt(cacheSizeSelect.value);
  let ramSize = parseInt(ramSizeSelect.value);
  
  let cacheMemory = []; // Array of { label: string, value: string, active: boolean }
  let ramMemory = [];   // Array of { label: string, value: string, active: boolean }
  
  // FIFO Queue & LRU Tracker (Stores cache block indices)
  let fifoQueue = [];
  let lruTracker = [];

  // --- Initialize Memory Blocks ---
  function initSimulation() {
    // Read selections
    cacheSize = parseInt(cacheSizeSelect.value);
    ramSize = parseInt(ramSizeSelect.value);
    
    // Clear elements
    cacheBlocksContainer.innerHTML = '';
    ramBlocksContainer.innerHTML = '';
    
    // Initialize Cache Memory State & UI
    cacheMemory = [];
    fifoQueue = [];
    lruTracker = [];
    for (let i = 0; i < cacheSize; i++) {
      cacheMemory.push({ label: 'C' + i, value: '-', active: false });
      
      const block = document.createElement('div');
      block.className = 'mem-block';
      block.id = 'cache-b-' + i;
      
      const label = document.createElement('span');
      label.className = 'block-label';
      label.textContent = 'C' + i;
      
      const val = document.createElement('span');
      val.className = 'block-value';
      val.textContent = '-';
      
      const meta = document.createElement('span');
      meta.className = 'block-meta';
      meta.textContent = '';
      
      block.appendChild(label);
      block.appendChild(val);
      block.appendChild(meta);
      cacheBlocksContainer.appendChild(block);
    }
    
    // Initialize RAM Memory State & UI with default mock numbers
    ramMemory = [];
    for (let i = 0; i < ramSize; i++) {
      // Pre-fill RAM with some sample variables (e.g. 10, 20, 30...)
      const mockVal = (i * 10).toString();
      ramMemory.push({ label: 'R' + i, value: mockVal, active: true });
      
      const block = document.createElement('div');
      block.className = 'mem-block active';
      block.id = 'ram-b-' + i;
      
      const label = document.createElement('span');
      label.className = 'block-label';
      label.textContent = 'R' + i;
      
      const val = document.createElement('span');
      val.className = 'block-value';
      val.textContent = mockVal;
      
      block.appendChild(label);
      block.appendChild(val);
      ramBlocksContainer.appendChild(block);
    }
    
    // Update labels and badges
    cachePolicyBadge.textContent = policySelect.value;
    ramSizeBadge.textContent = ramSize + ' Blok';
    
    // Reset Hardware components labels
    cpuVal.textContent = 'IDLE';
    aluVal.textContent = 'IDLE';
    cacheVal.textContent = 'READY';
    ramVal.textContent = 'READY';
    
    // Reset highlights
    resetComponentVisuals();
    hidePacket();
    
    // Draw connections
    setTimeout(drawLines, 50);
  }

  // --- Dynamic SVG Lines Drawing ---
  function drawLines() {
    if (window.getComputedStyle(motherboard).flexDirection === 'column') {
      // Mobile layout: Hide SVG lines
      document.getElementById('connector-svg').style.display = 'none';
      return;
    }
    
    document.getElementById('connector-svg').style.display = 'block';
    
    const mbRect = motherboard.getBoundingClientRect();
    
    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - mbRect.left + rect.width / 2,
        y: rect.top - mbRect.top + rect.height / 2
      };
    };

    const cCPU = getCenter(cpuEl);
    const cALU = getCenter(aluEl);
    const cCache = getCenter(cacheEl);
    const cRAM = getCenter(ramEl);

    // CPU to ALU path
    const p1 = `M ${cCPU.x} ${cCPU.y} L ${cALU.x} ${cALU.y}`;
    document.getElementById('line-cpu-alu').setAttribute('d', p1);
    pulseCpuAlu.setAttribute('d', p1);

    // ALU to Cache path
    const p2 = `M ${cALU.x} ${cALU.y} L ${cCache.x} ${cCache.y}`;
    document.getElementById('line-alu-cache').setAttribute('d', p2);
    pulseAluCache.setAttribute('d', p2);

    // Cache to RAM path
    const p3 = `M ${cCache.x} ${cCache.y} L ${cRAM.x} ${cRAM.y}`;
    document.getElementById('line-cache-ram').setAttribute('d', p3);
    pulseCacheRam.setAttribute('d', p3);
  }

  // --- Animate Data Packet ---
  function movePacket(fromUnit, toUnit, content, callback) {
    const mbRect = motherboard.getBoundingClientRect();
    const fromRect = fromUnit.getBoundingClientRect();
    const toRect = toUnit.getBoundingClientRect();
    
    const startX = fromRect.left - mbRect.left + fromRect.width / 2 - 14;
    const startY = fromRect.top - mbRect.top + fromRect.height / 2 - 14;
    
    const endX = toRect.left - mbRect.left + toRect.width / 2 - 14;
    const endY = toRect.top - mbRect.top + toRect.height / 2 - 14;
    
    // Set content and initial position
    dataPacket.textContent = content;
    dataPacket.style.transform = `translate(${startX}px, ${startY}px)`;
    dataPacket.style.opacity = '1';
    
    // Trigger pulse on the line
    setLinePulseActive(fromUnit.id, toUnit.id, true);

    // Force reflow
    dataPacket.offsetHeight;
    
    // Set final position
    dataPacket.style.transform = `translate(${endX}px, ${endY}px)`;
    
    setTimeout(() => {
      setLinePulseActive(fromUnit.id, toUnit.id, false);
      if (callback) callback();
    }, 600); // Transitions take 0.6s
  }

  function hidePacket() {
    dataPacket.style.opacity = '0';
  }

  function setLinePulseActive(fromId, toId, active) {
    let pulse = null;
    if ((fromId === 'cpu' && toId === 'alu') || (fromId === 'alu' && toId === 'cpu')) {
      pulse = pulseCpuAlu;
    } else if ((fromId === 'alu' && toId === 'cache') || (fromId === 'cache' && toId === 'alu')) {
      pulse = pulseAluCache;
    } else if ((fromId === 'cache' && toId === 'ram') || (fromId === 'ram' && toId === 'cache')) {
      pulse = pulseCacheRam;
    }
    
    if (pulse) {
      if (active) {
        pulse.classList.add('active');
      } else {
        pulse.classList.remove('active');
      }
    }
  }

  // --- Visual Reset Helper ---
  function resetComponentVisuals() {
    cpuEl.classList.remove('active');
    aluEl.classList.remove('active');
    cacheEl.classList.remove('active');
    ramEl.classList.remove('active');
    
    document.querySelectorAll('.mem-block').forEach(b => {
      b.classList.remove('highlight', 'evicting');
    });
  }

  // --- Terminal Logging Utility ---
  function logToConsole(message, type = 'info') {
    const time = new Date().toLocaleTimeString('tr-TR');
    const logLine = document.createElement('div');
    logLine.className = 'console-line ' + type;
    
    const ts = document.createElement('span');
    ts.className = 'timestamp';
    ts.textContent = `[${time}]`;
    
    const msg = document.createElement('span');
    msg.className = 'msg';
    msg.textContent = message;
    
    logLine.appendChild(ts);
    logLine.appendChild(msg);
    consoleBody.appendChild(logLine);
    
    // Auto scroll to bottom
    consoleBody.scrollTop = consoleBody.scrollHeight;
  }

  // --- Cache Replacement Policy Logic ---
  // Returns block index of the cache cell
  function writeToCache(value, policy) {
    // 1. Search for existing empty cache cell
    const emptyIndex = cacheMemory.findIndex(cell => !cell.active);
    
    if (emptyIndex !== -1) {
      cacheMemory[emptyIndex].value = value;
      cacheMemory[emptyIndex].active = true;
      
      // Track insertion for FIFO and LRU
      fifoQueue.push(emptyIndex);
      lruTracker.push(emptyIndex);
      
      updateCacheUI(emptyIndex);
      logToConsole(`[Cache] Veri önbellekteki boş hücreye (C${emptyIndex}) yerleştirildi.`, 'info');
      return { index: emptyIndex, evicted: null };
    }
    
    // 2. Cache is Full: Evict block according to policy
    let evictIndex;
    
    if (policy === 'FIFO') {
      evictIndex = fifoQueue.shift(); // Evict oldest loaded
      fifoQueue.push(evictIndex);     // Mark new as newest
      
      // Keep LRU in sync
      lruTracker = lruTracker.filter(idx => idx !== evictIndex);
      lruTracker.push(evictIndex);
    } else {
      // LRU Policy
      evictIndex = lruTracker.shift(); // Evict least recently used
      lruTracker.push(evictIndex);     // Mark new as recently accessed
      
      // Keep FIFO in sync
      fifoQueue = fifoQueue.filter(idx => idx !== evictIndex);
      fifoQueue.push(evictIndex);
    }
    
    const evictedValue = cacheMemory[evictIndex].value;
    
    // Update cache slot
    cacheMemory[evictIndex].value = value;
    cacheMemory[evictIndex].active = true;
    
    updateCacheUI(evictIndex);
    
    logToConsole(`[Cache] Önbellek dolu! ${policy} politikasına göre C${evictIndex} hücresindeki '${evictedValue}' tahliye edildi.`, 'warn');
    return { index: evictIndex, evicted: evictedValue };
  }

  function touchCacheBlock(index) {
    // Update LRU tracking order: move index to end
    lruTracker = lruTracker.filter(idx => idx !== index);
    lruTracker.push(index);
    
    // Highlight the Cache UI block metadata briefly
    updateCacheMetaUI();
  }

  function updateCacheUI(index) {
    const blockEl = document.getElementById('cache-b-' + index);
    if (blockEl) {
      blockEl.classList.add('active');
      const valEl = blockEl.querySelector('.block-value');
      valEl.textContent = cacheMemory[index].value;
    }
    updateCacheMetaUI();
  }

  function updateCacheMetaUI() {
    // Show priority badges inside the cache blocks for transparency
    const policy = policySelect.value;
    for (let i = 0; i < cacheSize; i++) {
      const metaEl = document.querySelector('#cache-b-' + i + ' .block-meta');
      if (metaEl) {
        if (!cacheMemory[i].active) {
          metaEl.textContent = '';
          continue;
        }
        if (policy === 'FIFO') {
          const fifoOrder = fifoQueue.indexOf(i);
          metaEl.textContent = fifoOrder !== -1 ? 'F' + fifoOrder : '';
        } else {
          const lruOrder = lruTracker.indexOf(i);
          metaEl.textContent = lruOrder !== -1 ? 'L' + lruOrder : '';
        }
      }
    }
  }

  // --- RAM Management ---
  function writeToRAM(value) {
    // Find empty block in RAM
    let emptyIndex = ramMemory.findIndex(cell => cell.value === '-' || !cell.active);
    
    if (emptyIndex === -1) {
      // Overwrite the first block if RAM is full
      emptyIndex = 0;
      logToConsole(`[RAM] RAM dolu. R0 hücresi '${ramMemory[0].value}' değerinden '${value}' değerine güncellendi.`, 'warn');
    } else {
      logToConsole(`[RAM] Veri RAM'deki boş R${emptyIndex} hücresine yazıldı.`, 'info');
    }
    
    ramMemory[emptyIndex].value = value;
    ramMemory[emptyIndex].active = true;
    
    const blockEl = document.getElementById('ram-b-' + emptyIndex);
    if (blockEl) {
      blockEl.classList.add('active');
      blockEl.querySelector('.block-value').textContent = value;
      blockEl.classList.add('highlight');
      setTimeout(() => blockEl.classList.remove('highlight'), 1000);
    }
    
    return emptyIndex;
  }

  // --- Manual Execution Async Flow ---
  async function runManualSimulation() {
    if (isManualRunning) return;
    
    // Pause Auto mode if active
    if (isAutoMode) {
      toggleAutoMode();
    }
    
    isManualRunning = true;
    startBtn.disabled = true;
    
    resetComponentVisuals();
    
    const in1 = parseFloat(input1El.value);
    const in2 = parseFloat(input2El.value);
    const op = operationSelect.value;
    const policy = policySelect.value;
    
    if (isNaN(in1) || (op !== 'NOT' && isNaN(in2))) {
      logToConsole("HATA: Lütfen geçerli sayı girdileri girin!", "err");
      isManualRunning = false;
      startBtn.disabled = false;
      return;
    }

    // Phase 1: CPU preparing data
    logToConsole(`[CPU] Veriler hazırlandı: Giriş A = ${in1}, Giriş B = ${op === 'NOT' ? 'Yok' : in2}`, 'system');
    cpuEl.classList.add('active');
    cpuVal.textContent = `A:${in1} B:${op === 'NOT' ? '-' : in2}`;
    
    await delay(800);
    
    // Move packet CPU -> ALU
    cpuEl.classList.remove('active');
    logToConsole("[Otobüs] Veriler ALU birimine aktarılıyor...", "info");
    
    const aluInputStr = op === 'NOT' ? `${in1}` : `${in1},${in2}`;
    
    await new Promise(resolve => {
      movePacket(cpuEl, aluEl, aluInputStr, resolve);
    });
    
    hidePacket();
    
    // Phase 2: ALU Computing
    aluEl.classList.add('active');
    let result;
    switch (op) {
      case 'ADD': result = in1 + in2; break;
      case 'SUB': result = in1 - in2; break;
      case 'MUL': result = in1 * in2; break;
      case 'DIV': 
        if (in2 === 0) {
          result = "ERR (Böl/0)";
          logToConsole("[ALU] Sıfıra bölme hatası!", "err");
        } else {
          result = Math.round((in1 / in2) * 100) / 100; 
        }
        break;
      case 'AND': result = Math.floor(in1) & Math.floor(in2); break;
      case 'OR': result = Math.floor(in1) | Math.floor(in2); break;
      case 'NOT': result = ~Math.floor(in1); break;
      default: result = 0;
    }
    
    aluVal.textContent = `${op}: ${result}`;
    logToConsole(`[ALU] Hesaplama yapıldı: ${op} = ${result}`, 'system');
    
    await delay(1000);
    
    // Move packet ALU -> Cache
    aluEl.classList.remove('active');
    logToConsole("[Otobüs] ALU sonucu önbelleğe gönderiliyor...", "info");
    
    await new Promise(resolve => {
      movePacket(aluEl, cacheEl, result.toString(), resolve);
    });
    
    hidePacket();
    
    // Phase 3: Cache lookup (Hit / Miss check)
    cacheEl.classList.add('active');
    cacheVal.textContent = 'CHECKING';
    logToConsole(`[Cache] Önbellekte '${result}' değeri aranıyor...`, 'info');
    
    await delay(1000);
    
    // Search Cache
    const cacheHitIndex = cacheMemory.findIndex(cell => cell.active && parseFloat(cell.value) === result);
    
    if (cacheHitIndex !== -1) {
      // CACHE HIT!
      cacheVal.textContent = 'HIT!';
      cacheEl.style.borderColor = 'var(--color-cache)';
      logToConsole(`[ÖNBELLEK HİT] Veri C${cacheHitIndex} hücresinde bulundu! RAM erişimine gerek kalmadı.`, 'info');
      
      const blockEl = document.getElementById('cache-b-' + cacheHitIndex);
      blockEl.classList.add('highlight');
      
      touchCacheBlock(cacheHitIndex);
      
      await delay(1500);
      blockEl.classList.remove('highlight');
    } else {
      // CACHE MISS!
      cacheVal.textContent = 'MISS!';
      cacheEl.style.borderColor = 'var(--color-cpu)';
      logToConsole("[ÖNBELLEK MISS] Veri önbellekte bulunamadı! RAM'e sorgu gönderiliyor...", "warn");
      
      await delay(1000);
      
      // Move packet Cache -> RAM
      cacheEl.classList.remove('active');
      cacheEl.style.borderColor = 'var(--border-color)';
      
      await new Promise(resolve => {
        movePacket(cacheEl, ramEl, result.toString(), resolve);
      });
      
      hidePacket();
      
      // Phase 4: RAM lookup
      ramEl.classList.add('active');
      ramVal.textContent = 'READ/WRITE';
      
      await delay(1000);
      
      // Search RAM
      const ramHitIndex = ramMemory.findIndex(cell => cell.active && parseFloat(cell.value) === result);
      
      if (ramHitIndex !== -1) {
        // RAM HIT
        logToConsole(`[RAM HİT] Veri R${ramHitIndex} hücresinde bulundu. RAM'den Cache'e yükleniyor...`, 'info');
        const blockEl = document.getElementById('ram-b-' + ramHitIndex);
        blockEl.classList.add('highlight');
        await delay(1000);
        blockEl.classList.remove('highlight');
      } else {
        // RAM MISS: Write to RAM first
        logToConsole("[RAM MISS] Veri RAM'de bulunamadı. Değer RAM'e yazılıyor...", "warn");
        writeToRAM(result.toString());
        await delay(1000);
      }
      
      // Move data from RAM to Cache
      ramEl.classList.remove('active');
      logToConsole("[Otobüs] Veri RAM'den çekilip Önbelleğe (Cache) yükleniyor...", "info");
      
      await new Promise(resolve => {
        movePacket(ramEl, cacheEl, result.toString(), resolve);
      });
      
      hidePacket();
      
      // Update Cache using policy
      cacheEl.classList.add('active');
      cacheVal.textContent = 'UPDATING';
      
      const cacheOutcome = writeToCache(result.toString(), policy);
      
      // Visual feedback for eviction if it happened
      if (cacheOutcome.evicted !== null) {
        const evictedBlockEl = document.getElementById('cache-b-' + cacheOutcome.index);
        evictedBlockEl.classList.add('evicting');
        await delay(800);
        evictedBlockEl.classList.remove('evicting');
      }
      
      const newBlockEl = document.getElementById('cache-b-' + cacheOutcome.index);
      newBlockEl.classList.add('highlight');
      
      await delay(1200);
      newBlockEl.classList.remove('highlight');
    }
    
    // Complete Manual cycle
    resetComponentVisuals();
    cpuVal.textContent = 'IDLE';
    aluVal.textContent = 'IDLE';
    cacheVal.textContent = 'READY';
    ramVal.textContent = 'READY';
    
    logToConsole("İşlem başarıyla tamamlandı. Sistem boşta (IDLE).", "system");
    isManualRunning = false;
    startBtn.disabled = false;
  }

  // --- Auto Cycle Timer Loop ---
  function autoCycleStep() {
    resetComponentVisuals();
    
    // Phase Machine for automatic looping demo
    switch (autoStep) {
      case 0:
        // CPU Step
        cpuEl.classList.add('active');
        cpuVal.textContent = 'FETCH';
        logToConsole("[Döngü] CPU yeni bir buyruk aldı (Buyruk: LOAD A).", "info");
        
        movePacket(cpuEl, aluEl, "LOAD A", null);
        autoStep = 1;
        break;
        
      case 1:
        // ALU Step
        aluEl.classList.add('active');
        aluVal.textContent = 'DECODE';
        logToConsole("[Döngü] ALU komut çözümlemesi (Decode) yapıyor.", "info");
        
        movePacket(aluEl, cacheEl, "ADDR_A", null);
        autoStep = 2;
        break;
        
      case 2:
        // Cache Step
        cacheEl.classList.add('active');
        cacheVal.textContent = 'LOOKUP';
        logToConsole("[Döngü] Cache (Önbellek) kontrol ediliyor...", "info");
        
        movePacket(cacheEl, ramEl, "MISS_REQ", null);
        autoStep = 3;
        break;
        
      case 3:
        // RAM Step
        ramEl.classList.add('active');
        ramVal.textContent = 'READING';
        logToConsole("[Döngü] Önbellekte bulunamadı. RAM'den okuma yapılıyor.", "info");
        
        movePacket(ramEl, cacheEl, "DATA_VAL", null);
        autoStep = 4;
        break;
        
      case 4:
        // Cache update
        cacheEl.classList.add('active');
        cacheVal.textContent = 'REFRESH';
        
        // Pick a random mock tag to put in Cache
        const mockTags = ['A', 'B', 'X', 'Y', 'Z', 'M'];
        const randomTag = mockTags[Math.floor(Math.random() * mockTags.length)];
        logToConsole(`[Döngü] RAM'den çekilen '${randomTag}' değeri önbelleğe yazılıyor.`, 'info');
        
        const cacheOutcome = writeToCache(randomTag, policySelect.value);
        
        autoStep = 5;
        break;
        
      case 5:
        // Cycle Reset
        logToConsole("[Döngü] Otomatik işlem döngüsü tamamlandı.", "system");
        autoStep = 0;
        break;
    }
  }

  function toggleAutoMode() {
    if (isAutoMode) {
      clearInterval(autoTimer);
      autoTimer = null;
      isAutoMode = false;
      autoBtn.textContent = 'Otomatik Döngü';
      autoBtn.classList.remove('active');
      logToConsole("Otomatik simülasyon döngüsü durduruldu.", "system");
      resetComponentVisuals();
      hidePacket();
    } else {
      isAutoMode = true;
      autoBtn.textContent = 'Durdur';
      autoBtn.classList.add('active');
      logToConsole("Otomatik simülasyon döngüsü başlatıldı.", "system");
      autoStep = 0;
      autoCycleStep(); // run immediately
      autoTimer = setInterval(autoCycleStep, speed);
    }
  }

  // --- Reset All state ---
  function resetAll() {
    if (isAutoMode) {
      toggleAutoMode();
    }
    isManualRunning = false;
    startBtn.disabled = false;
    
    // Clear terminal logs
    consoleBody.innerHTML = '';
    
    logToConsole("Simülasyon sıfırlandı. Yeni bellek yapıları oluşturuluyor.", "system");
    initSimulation();
  }

  // --- Delay Helper ---
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Event Listeners Binding ---
  
  startBtn.addEventListener('click', runManualSimulation);
  autoBtn.addEventListener('click', toggleAutoMode);
  resetBtn.addEventListener('click', resetAll);
  
  // Re-init structures when parameters are modified
  cacheSizeSelect.addEventListener('change', initSimulation);
  ramSizeSelect.addEventListener('change', initSimulation);
  policySelect.addEventListener('change', () => {
    cachePolicyBadge.textContent = policySelect.value;
    updateCacheMetaUI();
    logToConsole(`Tahliye politikası değiştirildi: ${policySelect.value}`, 'system');
  });

  // Slider change for auto speed
  speedRange.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    speedVal.textContent = (speed / 1000).toFixed(2) + 's';
    
    if (isAutoMode) {
      // Recreate interval with new speed
      clearInterval(autoTimer);
      autoTimer = setInterval(autoCycleStep, speed);
    }
  });

  // Clear log
  consoleClear.addEventListener('click', () => {
    consoleBody.innerHTML = '';
  });

  // Handle window resizing to keep SVG lines accurate
  window.addEventListener('resize', drawLines);

  // --- Launch App ---
  initSimulation();
  logToConsole("Simülatör hazır. Değerleri girin ve 'İşlemi Başlat' butonuna basın.", "system");
});
