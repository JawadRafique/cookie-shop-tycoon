const $ = (id) => document.getElementById(id);
const state = { day: 1, cash: 100, totalSold: 0, bestSold: 0, records: [] };
const forecasts = [
  ['A lovely day for a treat', 'A steady neighborhood crowd is expected. Price wisely!', 1],
  ['Sunny sidewalks, hungry shoppers', 'Foot traffic is a little stronger than usual today.', 1.18],
  ['A quiet afternoon ahead', 'Fewer people are out, so a friendly price may help.', .78],
  ['The school fair is nearby!', 'Families are looking for an after-school sweet treat.', 1.32],
  ['A cozy, drizzly day', 'Warm cookies have special appeal when it rains.', 1.1],
  ['A busy weekend is coming', 'The neighborhood is ready to indulge.', 1.24]
];
const money = (n) => `$${Math.abs(n).toFixed(2)}`;
function currentForecast() { return forecasts[(state.day - 1) % forecasts.length]; }
function updateCost() { const cost = Number($('cookies').value) * .45 + Math.max(0, Number($('advertising').value) || 0); $('cookieValue').textContent = $('cookies').value; $('upfrontCost').textContent = money(cost); }
function updateDashboard() {
  $('dayNumber').textContent = state.day; $('cashTop').textContent = money(state.cash); $('cashSnapshot').textContent = money(state.cash);
  $('totalSold').textContent = state.totalSold; $('bestDay').textContent = state.bestSold ? `${state.bestSold} cookies` : '—';
  $('progressText').textContent = `${state.day} / 30`; $('progressBar').style.width = `${((state.day - 1) / 30) * 100 + 3.33}%`;
  const f = currentForecast(); $('forecastTitle').textContent = f[0]; $('forecastBody').textContent = f[1];
  const dayName = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][(state.day - 1) % 7]; $('marketLabel').textContent = `${dayName.toUpperCase()} MORNING`;
}
function renderLedger() {
  if (!state.records.length) return;
  $('ledgerCaption').textContent = `${state.records.length} day${state.records.length === 1 ? '' : 's'} completed`;
  $('ledgerBody').innerHTML = state.records.slice().reverse().map(r => `<tr><td>Day ${r.day}</td><td>${r.sold} / ${r.baked}</td><td>${money(r.revenue)}</td><td>${money(r.expenses)}</td><td class="${r.profit >= 0 ? 'positive':'negative'}">${r.profit >= 0 ? '+' : '−'}${money(r.profit)}</td><td><strong>${money(r.cash)}</strong></td></tr>`).join('');
}
function closeResult() { $('resultModal').classList.add('hidden'); }
function openShop(event) {
  event.preventDefault(); const baked = Number($('cookies').value), price = Number($('price').value), ads = Number($('advertising').value);
  const error = $('formError'); error.textContent = '';
  if (!Number.isFinite(price) || price < .5 || price > 10) return error.textContent = 'Choose a cookie price between $0.50 and $10.00.';
  if (!Number.isFinite(ads) || ads < 0) return error.textContent = 'Advertising spend can’t be negative.';
  const expenses = baked * .45 + ads;
  if (expenses > state.cash + .001) return error.textContent = `That plan costs ${money(expenses)}, but you have ${money(state.cash)} available.`;
  const f = currentForecast(); const priceAppeal = Math.max(.08, 1.34 - price / 4.4); const adBoost = Math.min(1.65, 1 + Math.sqrt(ads) / 8);
  const buzz = .83 + Math.random() * .32; const demand = Math.round((23 + state.day * .55) * f[2] * priceAppeal * adBoost * buzz); const sold = Math.min(baked, Math.max(0, demand));
  const revenue = sold * price, profit = revenue - expenses; state.cash += profit; state.totalSold += sold; state.bestSold = Math.max(state.bestSold, sold);
  const record = {day:state.day,baked,sold,revenue,expenses,profit,cash:state.cash}; state.records.push(record); renderLedger(); updateDashboard();
  $('resultDay').textContent = state.day; $('resultSold').textContent = sold; $('resultBaked').textContent = baked; $('resultRevenue').textContent = money(revenue); $('resultExpenses').textContent = money(expenses); $('resultProfit').textContent = `${profit >= 0 ? '+' : '−'}${money(profit)}`; $('resultProfit').className = profit >= 0 ? 'positive' : 'negative'; $('resultCash').textContent = money(state.cash);
  $('resultBlurb').textContent = sold === baked && baked > 0 ? 'Sold out! The last cookie barely made it to closing time.' : sold === 0 ? 'No bites today—but every shopkeeper has a slow day.' : `${baked - sold} cookie${baked - sold === 1 ? '' : 's'} went to the neighborhood food pantry after closing.`;
  $('nextDay').textContent = state.day === 30 ? 'See month results →' : 'Plan the next day →'; $('resultModal').classList.remove('hidden');
}
function nextDay() { closeResult(); if (state.day === 30) { $('finalCash').textContent = money(state.cash); const change = state.cash - 100; $('finalChange').textContent = `${change >= 0 ? '+' : '−'}${money(change)} from your starting cash`; $('finalSold').textContent = state.totalSold; $('finalProfit').textContent = `${change >= 0 ? '+' : '−'}${money(change)}`; $('finalModal').classList.remove('hidden'); return; } state.day++; updateDashboard(); window.scrollTo({top:0,behavior:'smooth'}); }
function restart() { Object.assign(state,{day:1,cash:100,totalSold:0,bestSold:0,records:[]}); $('finalModal').classList.add('hidden'); $('ledgerBody').innerHTML = '<tr class="empty-row"><td colspan="6">Your first day’s results will appear here.</td></tr>'; $('ledgerCaption').textContent='No days completed yet'; updateDashboard(); }
['cookies','advertising'].forEach(id => $(id).addEventListener('input',updateCost)); $('decisionForm').addEventListener('submit',openShop); $('nextDay').addEventListener('click',nextDay); $('closeModal').addEventListener('click',closeResult); $('playAgain').addEventListener('click',restart); updateCost(); updateDashboard();
