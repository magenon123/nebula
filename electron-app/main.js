const { app, BrowserWindow, session } = require('electron');
const path = require('path');

const CASINO_URL = 'https://nebula-4ggz.onrender.com';

const DEMO_GAMES = {
  gates: {
    name: 'Gates of Olympus',
    url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20olympgold&jurisdiction=99&stylename=demo_clienthub&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com&gcpif=4963'
  },
  fisherman: {
    name: 'Gates of Olympus',
    url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20olympgold&jurisdiction=99&stylename=demo_clienthub&websiteUrl=https%3A%2F%2Fwww.pragmaticplay.com'
  }
};

let mainWin, gameWin;
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

  // intercept clicks on Olympian Storm (Gates demo) and Lake Legend (Le Fisherman demo)
  mainWin.webContents.on('did-finish-load', () => {
    mainWin.webContents.executeJavaScript(`
      (function(){
        // override the go() function to intercept game launches
        const origGo = window.go;
        window.go = function(slug) {
          if(slug === 'olympian-storm') {
            document.title = '__LAUNCH__gates';
            setTimeout(function(){ document.title = 'Nebula Casino'; }, 500);
            return;
          }
          if(slug === 'lake-legend') {
            document.title = '__LAUNCH__fisherman';
            setTimeout(function(){ document.title = 'Nebula Casino'; }, 500);
            return;
          }
          if(origGo) origGo(slug);
        };
      })();
    `);
  });

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
    return await mainWin.webContents.executeJavaScript(`
      (function(){
        if(typeof bal !== 'undefined' && !isNaN(bal)) return bal;
        const el = document.getElementById('balNum');
        if(el){ const n = parseFloat(el.textContent.replace(/[^0-9.]/g,'')); if(!isNaN(n)) return n; }
        return null;
      })()
    `);
  } catch(e) { return null; }
}

async function syncNebulaBalance(newBalance) {
  if (!mainWin) return;
  try {
    await mainWin.webContents.executeJavaScript(`
      (function(){
        const nb = ${newBalance};
        if(typeof bal !== 'undefined' && typeof paintBal === 'function'){ bal = nb; paintBal(0); return; }
        const el = document.getElementById('balNum');
        if(el) el.textContent = nb.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
      })()
    `);
  } catch(e) {}
}

async function launchGame(gameKey) {
  const game = DEMO_GAMES[gameKey];
  if (!game) return;

  nebulaBalance = await getNebulaBalance();
  if (!nebulaBalance || nebulaBalance <= 0) {
    mainWin.webContents.executeJavaScript(`alert('Could not read your balance. Make sure you are logged in.')`);
    return;
  }

  if (gameWin) { gameWin.focus(); return; }

  gameWin = new BrowserWindow({
    width: 1200,
    height: 800,
    title: game.name,
    parent: mainWin,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      webSecurity: false
    }
  });

  gameWin.setMenuBarVisibility(false);
  gameWin.loadURL(game.url);

  demoStartBalance = 0;
  conversionRate = 0;
  lastDemoBalance = 0;

  gameWin.webContents.on('did-finish-load', () => {
    setTimeout(() => startBalanceTracking(), 4000);
  });

  gameWin.on('closed', () => {
    stopBalanceTracking();
    gameWin = null;
  });
}

function startBalanceTracking() {
  if (!gameWin) return;

  gameWin.webContents.executeJavaScript(`
    (function(){
      let best = null;
      const all = document.querySelectorAll('*');
      for(const el of all){
        if(el.children.length === 0 && el.getBoundingClientRect().width > 0){
          const txt = el.textContent.trim();
          if(/^[\\d,]+\\.\\d{2}$/.test(txt)){
            const n = parseFloat(txt.replace(/,/g,''));
            if(!isNaN(n) && n >= 100 && n <= 200000){
              if(best === null || n > best) best = n;
            }
          }
        }
      }
      return best;
    })()
  `).then(val => {
    if (val && val > 0) {
      demoStartBalance = val;
      lastDemoBalance = val;
      conversionRate = nebulaBalance / val;
    }
  });

  balancePoller = setInterval(async () => {
    if (!gameWin) { stopBalanceTracking(); return; }
    if (!demoStartBalance || !conversionRate) return;

    try {
      const demoBal = await gameWin.webContents.executeJavaScript(`
        (function(){
          let best = null;
          const all = document.querySelectorAll('*');
          for(const el of all){
            if(el.children.length === 0 && el.getBoundingClientRect().width > 0){
              const txt = el.textContent.trim();
              if(/^[\\d,]+\\.\\d{2}$/.test(txt)){
                const n = parseFloat(txt.replace(/,/g,''));
                if(!isNaN(n) && n >= 0 && n <= 200000){
                  if(best === null || n > best) best = n;
                }
              }
            }
          }
          return best;
        })()
      `);

      if (demoBal === null) return;

      if (demoBal <= 0) {
        stopBalanceTracking();
        await syncNebulaBalance(0);
        gameWin && gameWin.close();
        mainWin.webContents.executeJavaScript(`alert('Your demo balance ran out. Please deposit to keep playing.')`);
        return;
      }

      const dropped = (demoStartBalance - demoBal) * conversionRate;
      if (dropped > nebulaBalance) {
        stopBalanceTracking();
        gameWin && gameWin.close();
        mainWin.webContents.executeJavaScript(`alert('You cannot bet more than your Nebula balance. Game closed.\\nYour balance was not changed.')`);
        return;
      }

      if (demoBal !== lastDemoBalance) {
        lastDemoBalance = demoBal;
        const newBal = Math.max(0, Math.round(demoBal * conversionRate * 100) / 100);
        await syncNebulaBalance(newBal);
      }

    } catch(e) {}
  }, 1000);
}

function stopBalanceTracking() {
  if (balancePoller) { clearInterval(balancePoller); balancePoller = null; }
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
