/**
 * Resource Monitor Helper (Project Final)
 * Path: C:\Users\HP 240\Downloads\chatbot-main
 *
 * Mengambil data presisi dari Node.js V8 & Process API:
 * - process.memoryUsage() (RSS, HeapTotal, HeapUsed, External, ArrayBuffers)
 * - process.cpuUsage() (User %, System %, Total %)
 * - Active Sessions count
 *
 * Murni READ-ONLY terhadap core code.
 */

const sessionState = require('../src/state/sessionState');

class ResourceMonitor {
  constructor() {
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = process.hrtime.bigint();
    this.peakRss = 0;
    this.peakHeapUsed = 0;
    this.peakCpu = 0;
    this.samples = [];
  }

  resetCpuBaseline() {
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = process.hrtime.bigint();
  }

  sample(tag = '') {
    const mem = process.memoryUsage();
    const currentCpu = process.cpuUsage(this.lastCpuUsage);
    const currentTime = process.hrtime.bigint();

    const elapsedNs = Number(currentTime - this.lastCpuTime);
    const elapsedMicros = elapsedNs / 1000;

    let userCpuPercent = 0;
    let systemCpuPercent = 0;
    let totalCpuPercent = 0;

    if (elapsedMicros > 0) {
      userCpuPercent = (currentCpu.user / elapsedMicros) * 100;
      systemCpuPercent = (currentCpu.system / elapsedMicros) * 100;
      totalCpuPercent = userCpuPercent + systemCpuPercent;
    }

    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = currentTime;

    const toMB = (bytes) => +(bytes / 1024 / 1024).toFixed(2);

    const rssMB = toMB(mem.rss);
    const heapUsedMB = toMB(mem.heapUsed);
    const heapTotalMB = toMB(mem.heapTotal);
    const externalMB = toMB(mem.external);
    const arrayBuffersMB = toMB(mem.arrayBuffers || 0);

    let activeSessions = 0;
    try {
      if (typeof sessionState.getSessionCount === 'function') {
        activeSessions = sessionState.getSessionCount();
      }
    } catch (_) {
      activeSessions = -1;
    }

    if (rssMB > this.peakRss) this.peakRss = rssMB;
    if (heapUsedMB > this.peakHeapUsed) this.peakHeapUsed = heapUsedMB;
    if (totalCpuPercent > this.peakCpu) this.peakCpu = +totalCpuPercent.toFixed(2);

    const snapshot = {
      timestamp: new Date().toISOString(),
      uptimeSec: +process.uptime().toFixed(1),
      tag,
      rssMB,
      heapUsedMB,
      heapTotalMB,
      externalMB,
      arrayBuffersMB,
      userCpuPercent: +userCpuPercent.toFixed(2),
      systemCpuPercent: +systemCpuPercent.toFixed(2),
      totalCpuPercent: +totalCpuPercent.toFixed(2),
      activeSessions,
    };

    this.samples.push(snapshot);
    return snapshot;
  }

  getAggregate(filterTag = null) {
    const list = filterTag
      ? this.samples.filter((s) => s.tag === filterTag)
      : this.samples;

    if (list.length === 0) return null;

    let totalRss = 0;
    let totalHeapUsed = 0;
    let totalCpu = 0;
    let maxRss = 0;
    let maxHeapUsed = 0;
    let maxCpu = 0;
    let maxExternal = 0;

    for (const s of list) {
      totalRss += s.rssMB;
      totalHeapUsed += s.heapUsedMB;
      totalCpu += s.totalCpuPercent;
      if (s.rssMB > maxRss) maxRss = s.rssMB;
      if (s.heapUsedMB > maxHeapUsed) maxHeapUsed = s.heapUsedMB;
      if (s.totalCpuPercent > maxCpu) maxCpu = s.totalCpuPercent;
      if (s.externalMB > maxExternal) maxExternal = s.externalMB;
    }

    return {
      count: list.length,
      avgRssMB: +(totalRss / list.length).toFixed(2),
      avgHeapUsedMB: +(totalHeapUsed / list.length).toFixed(2),
      avgCpuPercent: +(totalCpu / list.length).toFixed(2),
      maxRssMB: +maxRss.toFixed(2),
      maxHeapUsedMB: +maxHeapUsed.toFixed(2),
      maxCpuPercent: +maxCpu.toFixed(2),
      maxExternalMB: +maxExternal.toFixed(2),
      latest: list[list.length - 1],
    };
  }
}

module.exports = ResourceMonitor;
