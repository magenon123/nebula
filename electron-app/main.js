const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

const CASINO_URL = 'https://nebula-4ggz.onrender.com';

const GAMES = {
  gates: {
    name: 'Gates of Olympus Super Scatter',
    url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=4963&gameSymbol=vs20olympgold&jurisdiction=99',
    startBalance: 5000,
    // CSS selector for balance element — will be detected at runtime
    balanceSelector: null
  },
  fisherman: {
    name: 'Le Fisherman',
    url: 'https://static-live.hacksawgaming.com/launcher/static-launcher.html?gameid=2057&channel=mobile&language=en&partner=demo&mode=demo&token=123',
    startBalance: 5000,
    balanceSelector: null
  }
};

let mainWin, casinoWin, gameWin;
let currentGame = null;
let nebulaBalance = 0;
let demoStartBalance = 0;
let conversionRate = 0;
let balancePoller = null;
let lastDemoBalance = 0;

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

  // inject the game launcher button into the casino
  mainWin.webContents.on('did-finish-load', () => {
    mainWin.webContents.executeJavaScript(`
      (function(){
        if(document.getElementById('nebula-game-launcher')) return;
        const btn = document.createElement('div');
        btn.id = 'nebula-game-launcher';
        btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;';
        btn.innerHTML = \`
          <div style="background:#1a1a2e;border:2px solid #e94560;border-radius:12px;padding:12px;color:#fff;font-family:Arial;box-shadow:0 4px 20px rgba(233,69,96,0.4)">
            <div style="font-size:11px;color:#e94560;font-weight:bold;margin-bottom:8px;text-align:center">DEMO GAMES</div>
            <button onclick="window.launchGame('gates')" style="display:block;width:100%;margin-bottom:6px;padding:8px 14px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:bold">Gates of Olympus</button>
            <button onclick="window.launchGame('fisherman')" style="display:block;width:100%;padding:8px 14px;background:linear-gradient(135deg,#11998e,#38ef7d);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:bold">Le Fisherman</button>
          </div>
        \`;
        document.body.appendChild(btn);

        window.launchGame = function(gameKey) {
          window.__nebulaLaunchGame = gameKey;
        };

        setInterval(function(){
          if(window.__nebulaLaunchGame){
            const key = window.__nebulaLaunchGame;
            window.__nebulaLaunchGame = null;
            // send to main process via title trick
            document.title = '__LAUNCH__' + key;
            setTimeout(()=>{ document.title = 'Nebula Casino'; }, 500);
          }
        }, 200);
      })();
    `);
  });

  // watch for game launch requests via title change
  mainWin.webContents.on('page-title-updated', (e, title) => {
    if (title.startsWith('__LAUNCH__')) {
      const key = title.replace('__LAUNCH__', '');
      e.preventDefault();
      launchGame(key);
    }
  });
}

async function getNebulaBalance() {
  try {
    const result = await mainWin.webContents.executeJavaScript(`
      (function(){
        // use nebula's own bal variable if available
        if(typeof bal !== 'undefined' && !isNaN(bal)) return bal;
        // fallback: read from #balNum
        const el = document.getElementById('balNum');
        if(el){
          const n = parseFloat(el.textContent.replace(/[^0-9.]/g,''));
          if(!isNaN(n)) return n;
        }
        return null;
      })()
    `);
    return result;
  } catch(e) {
    return null;
  }
}

async function launchGame(gameKey) {
  const game = GAMES[gameKey];
  if (!game) return;

  // get current nebula balance
  nebulaBalance = await getNebulaBalance();
  if (nebulaBalance === null || nebulaBalance <= 0) {
    mainWin.webContents.executeJavaScript(`alert('Could not read your balance. Make sure you are logged in.')`);
    return;
  }

  currentGame = gameKey;

  gameWin = new BrowserWindow({
    width: 1200,
    height: 800,
    title: game.name,
    parent: mainWin,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false, // needed to inject scripts into game page
      webSecurity: false       // allow cross-origin for demo games
    }
  });

  gameWin.setMenuBarVisibility(false);
  gameWin.loadURL(game.url);

  gameWin.webContents.on('did-finish-load', async () => {
    // wait a moment for game to fully init
    setTimeout(() => startBalanceTracking(gameKey), 3000);
  });

  gameWin.on('closed', () => {
    stopBalanceTracking();
    gameWin = null;
    currentGame = null;
  });
}

function startBalanceTracking(gameKey) {
  if (!gameWin) return;

  // detect starting demo balance
  gameWin.webContents.executeJavaScript(`
    (function(){
      // scan all text nodes and elements for a money amount
      const all = document.querySelectorAll('*');
      for(const el of all){
        if(el.children.length === 0){
          const txt = el.textContent.trim().replace(/[^0-9.]/g,'');
          const n = parseFloat(txt);
          if(!isNaN(n) && n >= 100 && n <= 1000000){
            return {selector: el.className || el.id || el.tagName, value: n, text: el.textContent.trim()};
          }
        }
      }
      return null;
    })()
  `).then(result => {
    if (result) {
      demoStartBalance = result.value;
      lastDemoBalance = demoStartBalance;
      conversionRate = nebulaBalance / demoStartBalance;
      console.log(`Demo start balance: ${demoStartBalance}, Nebula balance: ${nebulaBalance}, Rate: ${conversionRate}`);
    }
  });

  // poll demo balance every second
  balancePoller = setInterval(async () => {
    if (!gameWin) { stopBalanceTracking(); return; }

    try {
      const demoBalance = await gameWin.webContents.executeJavaScript(`
        (function(){
          const all = document.querySelectorAll('*');
          for(const el of all){
            if(el.children.length === 0){
              const txt = el.textContent.trim().replace(/[^0-9.,]/g,'').replace(',','.');
              const n = parseFloat(txt);
              if(!isNaN(n) && n >= 0 && n <= 1000000 && el.getBoundingClientRect().width > 0){
                return n;
              }
            }
          }
          return null;
        })()
      `);

      if (demoBalance === null) return;

      // check if balance hit 0
      if (demoBalance <= 0) {
        stopBalanceTracking();
        // sync final 0 balance
        await syncNebulaBalance(0);
        gameWin && gameWin.close();
        mainWin.webContents.executeJavaScript(`
          alert('Your demo balance ran out. Please deposit to keep playing.');
        `);
        return;
      }

      // check overbetting — if demo dropped more than nebula balance allows
      const demoDropped = demoStartBalance - demoBalance;
      const realDropped = demoDropped * conversionRate;
      if (realDropped > nebulaBalance) {
        stopBalanceTracking();
        gameWin && gameWin.close();
        mainWin.webContents.executeJavaScript(`
          alert('You cannot bet more than your Nebula balance. The game has been closed.\\nYour balance was not changed.');
        `);
        return;
      }

      // sync balance change to nebula
      if (demoBalance !== lastDemoBalance) {
        lastDemoBalance = demoBalance;
        const newNebulaBalance = Math.max(0, Math.round((demoBalance * conversionRate) * 100) / 100);
        await syncNebulaBalance(newNebulaBalance);
      }

    } catch(e) {
      // game page navigated or closed
    }
  }, 1000);
}

function stopBalanceTracking() {
  if (balancePoller) {
    clearInterval(balancePoller);
    balancePoller = null;
  }
}

async function syncNebulaBalance(newBalance) {
  if (!mainWin) return;
  try {
    await mainWin.webContents.executeJavaScript(`
      (function(){
        const nb = ${newBalance};
        if(typeof bal !== 'undefined' && typeof paintBal === 'function'){
          bal = nb;
          paintBal(0);
          return 'ok';
        }
        // fallback: update display directly
        const el = document.getElementById('balNum');
        if(el) el.textContent = nb.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
        return 'dom';
      })()
    `);
  } catch(e) {}
}

app.whenReady().then(() => {
  // disable web security to allow loading game URLs
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    callback({ requestHeaders: details.requestHeaders });
  });

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
