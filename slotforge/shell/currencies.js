/* Display currencies. Balances and bets are stored in USD on the server; every screen converts for display only.
   [code, symbol, units per 1 USD, decimals, name]. Rates are fixed approximations (update the numbers here to refresh them everywhere). */
const SF_CURRENCIES = [
  ['USD', '$', 1, 2, 'US Dollar'], ['EUR', '€', 0.92, 2, 'Euro'], ['GBP', '£', 0.78, 2, 'British Pound'], ['JPY', '¥', 150, 0, 'Japanese Yen'],
  ['IDR', 'Rp', 16300, 0, 'Indonesian Rupiah'], ['ARS', 'AR$', 1300, 2, 'Argentine Peso'], ['BRL', 'R$', 5.5, 2, 'Brazilian Real'], ['MXN', 'MX$', 19.5, 2, 'Mexican Peso'],
  ['INR', '₹', 84, 2, 'Indian Rupee'], ['TRY', '₺', 38, 2, 'Turkish Lira'], ['PHP', '₱', 57, 2, 'Philippine Peso'], ['VND', '₫', 25400, 0, 'Vietnamese Dong'],
  ['KRW', '₩', 1400, 0, 'South Korean Won'], ['CAD', 'C$', 1.38, 2, 'Canadian Dollar'], ['AUD', 'A$', 1.55, 2, 'Australian Dollar'], ['CNY', 'CN¥', 7.25, 2, 'Chinese Yuan'],
  ['RUB', '₽', 90, 2, 'Russian Ruble'], ['NGN', '₦', 1550, 2, 'Nigerian Naira'], ['ZAR', 'R', 18, 2, 'South African Rand'], ['THB', '฿', 34, 2, 'Thai Baht'],
  ['PLN', 'zł', 4, 2, 'Polish Zloty'], ['CLP', 'CL$', 960, 0, 'Chilean Peso'], ['COP', 'CO$', 4200, 0, 'Colombian Peso'], ['PEN', 'S/', 3.75, 2, 'Peruvian Sol'],
  ['EGP', 'E£', 49, 2, 'Egyptian Pound'], ['PKR', 'Rs', 280, 0, 'Pakistani Rupee'], ['BDT', '৳', 120, 2, 'Bangladeshi Taka'], ['UAH', '₴', 41, 2, 'Ukrainian Hryvnia'],
  ['KZT', '₸', 500, 0, 'Kazakhstani Tenge'], ['CZK', 'Kč', 23, 2, 'Czech Koruna']
];
function sfCur() { try { const c = localStorage.getItem('stakeCurrency'); return SF_CURRENCIES.find(x => x[0] === c) || SF_CURRENCIES[0]; } catch { return SF_CURRENCIES[0]; } }
function sfParts(usd) { const c = sfCur(), d = c[3]; return { sym: c[1] + (c[1].length > 1 ? ' ' : ''), num: (Number(usd) * c[2]).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) }; }
function sfMoney(usd) { const p = sfParts(usd); return p.sym + p.num; }
