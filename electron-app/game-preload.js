// Intercept XHR to catch reloadBalance.do responses from Pragmatic Play
const _open = XMLHttpRequest.prototype.open;
const _send = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
  this.__url = url;
  return _open.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
  this.addEventListener('load', function() {
    try {
      if (this.__url && this.__url.includes('reloadBalance')) {
        const match = this.responseText.match(/(?:^|&)balance=([0-9.]+)/);
        if (match) {
          const val = parseFloat(match[1]);
          window.__ppBalance = val;
          try { window.top.__ppBalance = val; } catch(_) {}
        }
      }
    } catch (_) {}
  });
  return _send.apply(this, arguments);
};
