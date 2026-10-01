// intercept WebSocket to read Pragmatic Play balance updates
const _WS = window.WebSocket;
window.WebSocket = function(url, proto) {
  const ws = proto ? new _WS(url, proto) : new _WS(url);
  ws.addEventListener('message', function(e) {
    try {
      const d = typeof e.data === 'string' ? JSON.parse(e.data) : null;
      if (!d) return;
      const bal =
        d.balance ??
        d.credits ??
        d.credit ??
        d.bal ??
        d.balanceAmount ??
        (d.data && d.data.balance) ??
        (d.result && d.result.balance) ??
        (d.gameData && d.gameData.balance);
      if (bal !== undefined && bal !== null) {
        window.__ppBalance = parseFloat(bal);
      }
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
