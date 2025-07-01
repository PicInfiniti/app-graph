let algoWorker = null;
const jobQueue = [];
let isBusy = false;
const memoCache = new Map();
const TIMEOUT_MS = 5000;

export function runGraphAlgorithm(type, graph, callback, payload = {}) {
  const json = graph.export();
  const key = JSON.stringify({ type, graph: json, payload });

  // ✅ MEMOIZATION
  if (memoCache.has(key)) {
    callback(memoCache.get(key));
    return;
  }

  // ✅ Queue the job
  jobQueue.push({ type, graph: json, payload, callback, key });
  processNextJob();
}

function processNextJob() {
  if (isBusy || jobQueue.length === 0) return;

  const job = jobQueue.shift();
  const { type, graph, payload, callback, key } = job;
  isBusy = true;

  // Setup worker
  if (!algoWorker) {
    algoWorker = new Worker(
      new URL("./graph-algorithms.worker.js", import.meta.url),
      {
        type: "module",
      },
    );
  }

  // ✅ TIMEOUT watchdog
  const timeoutId = setTimeout(() => {
    console.warn(`[${type}] timed out. Restarting worker...`);
    algoWorker.terminate();
    algoWorker = null;
    isBusy = false;
    processNextJob();
  }, TIMEOUT_MS);

  // Set up listener
  algoWorker.onmessage = ({ data }) => {
    clearTimeout(timeoutId);
    isBusy = false;

    if (data.error) {
      console.error(`[Worker Error] ${type}:`, data.error);
    } else {
      memoCache.set(key, data.result); // ✅ Cache result
      callback(data.result);
    }

    processNextJob(); // Run next job
  };

  algoWorker.postMessage({ type, graph, payload });
}
