const apiKey = "8eca64515f2a4e58a6ee1152d5fc384b";

function getLastTradingDate() {
  const now = new Date();

  // اگر هنوز داده روز جاری کامل نشده (قبل از ساعت 23:59 UTC)، روز قبل را انتخاب کن
  if (now.getUTCHours() < 23) {
    now.setUTCDate(now.getUTCDate() - 1);
  }

  let day = now.getUTCDay();

  // آخر هفته‌ها بازار تعطیل است، تاریخ را به آخرین روز معاملاتی منتقل کن
  if (day === 0) { // یکشنبه
    now.setUTCDate(now.getUTCDate() - 2); // جمعه
  } else if (day === 6) { // شنبه
    now.setUTCDate(now.getUTCDate() - 1); // جمعه
  }

  return now.toISOString().split("T")[0];
}

async function fetchGoldData() {
  const date = getLastTradingDate();

  const url = `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1day&start_date=${date}&end_date=${date}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!result.values || result.values.length === 0) {
      throw new Error("داده‌ای برای این تاریخ موجود نیست.");
    }

    const data = result.values[0];
    const high = parseFloat(data.high);
    const low = parseFloat(data.low);
    const close = parseFloat(data.close);
    const open = parseFloat(data.open);

    calculateModifiedPivots(open, high, low, close, date);
  } catch (error) {
    console.error("خطا در API:", error);
    document.getElementById("results").innerHTML =
      "<p style='color:red;'>خطا در دریافت اطلاعات بازار طلا.</p>";
  }
}

function calculateModifiedPivots(open, high, low, close, date) {
  const pivot = (high + low + close + open) / 4;
  const r1 = (2 * pivot) - low;
  const s1 = (2 * pivot) - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  document.getElementById("results").innerHTML = `
    <h2>نقاط پیوت مودیفای برای تاریخ ${date}</h2>
    <table style="border-collapse: collapse; width: 100%; text-align: center;">
      <tr style="background-color:#f0f0f0;"><th>نقطه</th><th>قیمت</th></tr>
      <tr><td style="color:green;">R3</td><td>${r3.toFixed(2)}</td></tr>
      <tr><td>R2</td><td>${r2.toFixed(2)}</td></tr>
      <tr><td>R1</td><td>${r1.toFixed(2)}</td></tr>
      <tr style="background-color:#e8e8e8;"><td><strong>Pivot</strong></td><td><strong>${pivot.toFixed(2)}</strong></td></tr>
      <tr><td>S1</td><td>${s1.toFixed(2)}</td></tr>
      <tr><td>S2</td><td>${s2.toFixed(2)}</td></tr>
      <tr><td style="color:red;">S3</td><td>${s3.toFixed(2)}</td></tr>
    </table>
  `;
}

window.onload = fetchGoldData;
