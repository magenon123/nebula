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

const DEMO_START_BALANCE = 100000; // Pragmatic Play gives 100k demo credits

function findBalanceInObject(obj, depth) {
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
      const found = findBalanceInObject(obj[k], depth + 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

let mainWin, gameWin;
let nebulaBalance = 0;
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
      webSecurity: false,
      allowRunningInsecureContent: true,
      partition: 'persist:game',
      preload: path.join(__dirname, 'game-preload.js')
    }
  });

  gameWin.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  gameWin.setMenuBarVisibility(false);
  gameWin.loadURL(game.url);

  conversionRate = nebulaBalance / DEMO_START_BALANCE;
  lastDemoBalance = DEMO_START_BALANCE;

  // show 100k on Nebula while playing
  await syncNebulaBalance(DEMO_START_BALANCE);

  // Use CDP to intercept reloadBalance.do XHR responses for live balance
  try {
    gameWin.webContents.debugger.attach('1.3');
    gameWin.webContents.debugger.sendCommand('Network.enable');
    gameWin.webContents.debugger.on('message', async (event, method, params) => {
      try {
        if (method !== 'Network.responseReceived') return;
        if (!params.response.url.includes('reloadBalance')) return;
        const body = await gameWin.webContents.debugger.sendCommand(
          'Network.getResponseBody', { requestId: params.requestId }
        );
        const d = JSON.parse(body.body);
        const bal = findBalanceInObject(d, 0);
        if (bal !== undefined && bal >= 0) lastDemoBalance = bal;
      } catch (_) {}
    });
  } catch (e) {}

  gameWin.webContents.on('did-finish-load', () => {
    setTimeout(() => startBalanceTracking(), 4000);
  });

  gameWin.on('closed', async () => {
    stopBalanceTracking();
    // restore real balance adjusted for profit/loss
    const finalDemoBal = lastDemoBalance;
    const profitLoss = (finalDemoBal - DEMO_START_BALANCE) * conversionRate;
    const finalNebulaBal = Math.max(0, Math.round((nebulaBalance + profitLoss) * 100) / 100);
    await syncNebulaBalance(finalNebulaBal);
    gameWin = null;
  });
}

function startBalanceTracking() {
  if (!gameWin) return;

  // conversionRate already set from known 100k start balance

  let prevDemoBal = DEMO_START_BALANCE;
  balancePoller = setInterval(async () => {
    if (!gameWin) { stopBalanceTracking(); return; }
    if (!conversionRate) return;

    const demoBal = lastDemoBalance;
    if (demoBal === prevDemoBal) return;
    prevDemoBal = demoBal;

    if (demoBal <= 0) {
      stopBalanceTracking();
      await syncNebulaBalance(0);
      gameWin && gameWin.close();
      mainWin.webContents.executeJavaScript(`alert('Your demo balance ran out.')`);
      return;
    }

    const dropped = (DEMO_START_BALANCE - demoBal) * conversionRate;
    if (dropped > nebulaBalance) {
      stopBalanceTracking();
      gameWin && gameWin.close();
      mainWin.webContents.executeJavaScript(`alert('You cannot bet more than your Nebula balance. Game closed.')`);
      return;
    }

    const profitLoss = (demoBal - DEMO_START_BALANCE) * conversionRate;
    const newBal = Math.max(0, Math.round((nebulaBalance + profitLoss) * 100) / 100);
    await syncNebulaBalance(newBal);
  }, 1000);
}

function stopBalanceTracking() {
  if (balancePoller) { clearInterval(balancePoller); balancePoller = null; }
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    if (details.url.includes('pragmaticplay')) {
      details.requestHeaders['Referer'] = 'https://clienthub.pragmaticplay.com/';
      details.requestHeaders['Origin'] = 'https://clienthub.pragmaticplay.com';
    }
    callback({ requestHeaders: details.requestHeaders });
  });
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
