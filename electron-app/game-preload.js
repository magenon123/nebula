// Intercept WebSocket to read Pragmatic Play balance updates
// Recursively scan messages for any key containing 'bal', 'credit', 'cash', 'coin'
function findBalance(obj, depth) {
  if (!obj || typeof obj !== 'object' || depth > 6) return undefined;
  for (const k of Object.keys(obj)) {
    const kl = k.toLowerCase();
    if ((kl.includes('bal') || kl.includes('credit') || kl.includes('cash') || kl.includes('coin')) &&
        typeof obj[k] === 'number' && obj[k] >= 0 && obj[k] <= 2000000) {
      return obj[k];
    }
  }
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'object') {
      const found = findBalance(obj[k], depth + 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

const _WS = window.WebSocket;
window.WebSocket = function(url, proto) {
  const ws = proto ? new _WS(url, proto) : new _WS(url);
  ws.addEventListener('message', function(e) {
    try {
      if (typeof e.data !== 'string') return;
      const d = JSON.parse(e.data);
      const bal = findBalance(d, 0);
      if (bal !== undefined) window.__ppBalance = bal;
    } catch (_) {}
  });
  return ws;
};
Object.setPrototypeOf(window.WebSocket, _WS);
window.WebSocket.prototype = _WS.prototype;
window.WebSocket.CONNECTING = _WS.CONNECTING;
window.WebSocket.OPEN = _WS.OPEN;
window.WebSocket.CLOSING = _WS.CLOSING;
window.WebSocket.CLOSED = _WS.CLOSED;
