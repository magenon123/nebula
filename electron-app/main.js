const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

const CASINO_URL = 'https://nebula-4ggz.onrender.com';

let mainWin;

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Nebula Casino',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWin.loadURL(CASINO_URL);
  mainWin.setMenuBarVisibility(false);

  // inject the quick-nav panel into the casino
  mainWin.webContents.on('did-finish-load', () => {
    mainWin.webContents.executeJavaScript(`
      (function(){
        if(document.getElementById('nebula-game-launcher')) return;
        const panel = document.createElement('div');
        panel.id = 'nebula-game-launcher';
        panel.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;';
        panel.innerHTML = \`
          <div style="background:#1a1a2e;border:2px solid #e94560;border-radius:12px;padding:12px;color:#fff;font-family:Arial;box-shadow:0 4px 20px rgba(233,69,96,0.4)">
            <div style="font-size:11px;color:#e94560;font-weight:bold;margin-bottom:8px;text-align:center">OUR GAMES</div>
            <button onclick="location.href='/lake-legend'" style="display:block;width:100%;margin-bottom:6px;padding:8px 14px;background:linear-gradient(135deg,#11998e,#38ef7d);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:bold">🎣 Lake Legend</button>
            <button onclick="location.href='/olympian-storm'" style="display:block;width:100%;padding:8px 14px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:bold">⚡ Olympian Storm</button>
          </div>
        \`;
        document.body.appendChild(panel);
      })();
    `);
  });
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    callback({ requestHeaders: details.requestHeaders });
  });

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
