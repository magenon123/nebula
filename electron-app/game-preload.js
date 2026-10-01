// Debug: confirm preload is running
window.__preloadRan = true;
window.__ppBalance = undefined;

function sendBalance(val) {
  window.__ppBalance = val;
  try {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('pp-balance', val);
  } catch(e) {
    window.__ipcError = String(e);
  }
}

// Intercept XHR
const _open = XMLHttpRequest.prototype.open;
const _send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function(method, url) {
  this.__url = url;
  return _open.apply(this, arguments);
};
XMLHttpRequest.prototype.send = function() {
  this.addEventListener('load', function() {
    try {
      window.__lastUrl = this.__url;
      if (this.__url && this.__url.includes('reloadBalance')) {
        window.__lastReloadBalanceResponse = this.responseText;
        const match = this.responseText.match(/(?:^|&)balance=([0-9.]+)/);
        if (match) sendBalance(parseFloat(match[1]));
      }
    } catch(e) { window.__xhrError = String(e); }
  });
  return _send.apply(this, arguments);
};

// Intercept Fetch
const _fetch = window.fetch;
if (_fetch) {
  window.fetch = async function(url, opts) {
    const res = await _fetch.apply(this, arguments);
    try {
      const u = typeof url === 'string' ? url : (url && url.url) || '';
      if (u.includes('reloadBalance')) {
        const clone = res.clone();
        const text = await clone.text();
        window.__lastReloadBalanceResponse = text;
        const match = text.match(/(?:^|&)balance=([0-9.]+)/);
        if (match) sendBalance(parseFloat(match[1]));
      }
    } catch(e) { window.__fetchError = String(e); }
    return res;
  };
}
