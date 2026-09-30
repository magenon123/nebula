const { app, BrowserWindow, session } = require('electron');
const path = require('path');

const CASINO_URL = 'https://nebula-4ggz.onrender.com';

const DEMO_GAMES = {
  gates: {
    name: 'Gates of Olympus',
    url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=4963&gameSymbol=vs20olympgold&jurisdiction=99',
    startBalance: 5000
  },
  fisherman: {
    name: 'Le Fisherman',
    url: 'https://static-live.hacksawgaming.com/launcher/static-launcher.html?gameid=2057&channel=mobile&language=en&partner=demo&mode=demo&token=123',
    startBalance: 5000
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

  // add Gates of Olympus and Le Fisherman cards to the game grid
  mainWin.webContents.on('did-finish-load', () => {
    mainWin.webContents.executeJavaScript(`
      (function(){
        function addDemoCards() {
          if(document.getElementById('nebula-demo-gates')) return true;
          const grid = document.querySelector('div[class*="games"],ul[class*="games"],div[class*="grid"],div[class*="lobby"],div[class*="list"]');
          if(!grid) return false;

          function makeCard(id, title, sub, img, gameKey, gradient) {
            const card = document.createElement('div');
            card.id = id;
            card.style.cssText = 'display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;margin:8px;width:160px;vertical-align:top;';
            card.innerHTML =
              '<div style="width:160px;height:120px;border-radius:12px;overflow:hidden;background:' + gradient + ';position:relative;">' +
                '<img src="' + img + '" style="width:100%;height:100%;object-fit:cover;">' +
                '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);color:#fff;font-size:9px;text-align:center;padding:3px;">DEMO</div>' +
              '</div>' +
              '<div style="color:#fff;font-size:12px;margin-top:6px;text-align:center;font-weight:bold;">' + title + '</div>' +
              '<div style="color:#aaa;font-size:10px;">' + sub + '</div>';
            card.onclick = function() {
              document.title = '__LAUNCH__' + gameKey;
              setTimeout(function(){ document.title = 'Nebula Casino'; }, 500);
            };
            return card;
          }

          const gatesCard = makeCard('nebula-demo-gates', 'Gates of Olympus', 'Pragmatic Play', 'https://cdn2.softswiss.net/i/s4/pragmaticexternal/vs20olympgold.png', 'gates', 'linear-gradient(135deg,#667eea,#764ba2)');
          const fishCard = makeCard('nebula-demo-fisherman', 'Le Fisherman', 'Hacksaw Gaming', 'https://cdn2.softswiss.net/i/s4/hacksaw/LeTheFisherman.png', 'fisherman', 'linear-gradient(135deg,#11998e,#38ef7d)');

          grid.prepend(fishCard);
          grid.prepend(gatesCard);
          return true;
        }

        let tries = 0;
        const iv = setInterval(function(){
          tries++;
          if(addDemoCards() || tries > 30) clearInterval(iv);
        }, 500);
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
      const all = document.querySelectorAll('*');
      for(const el of all){
        if(el.children.length === 0){
          const txt = el.textContent.trim().replace(/[^0-9.]/g,'');
          const n = parseFloat(txt);
          if(!isNaN(n) && n >= 100 && n <= 100000 && el.getBoundingClientRect().width > 0) return n;
        }
      }
      return null;
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
          const all = document.querySelectorAll('*');
          for(const el of all){
            if(el.children.length === 0){
              const txt = el.textContent.trim().replace(/[^0-9.,]/g,'').replace(',','.');
              const n = parseFloat(txt);
              if(!isNaN(n) && n >= 0 && n <= 100000 && el.getBoundingClientRect().width > 0) return n;
            }
          }
          return null;
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
