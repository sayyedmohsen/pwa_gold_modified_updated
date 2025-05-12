const apiKey = "8eca64515f2a4e58a6ee1152d5fc384b";

// دریافت تاریخ به‌صورت YYYY-MM-DD
function getUTCDateNDaysAgo(n) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - n);
  return date.toISOString().split("T")[0];
}

// بررسی تا 5 روز گذشته برای یافتن داده معتبر
async function fetchLatestAvailableData(maxDays = 5) {
  for (let i = 1; i <= maxDays; i++) {
    const date = getUTCDateNDaysAgo(i);
    const url = `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1day&start_date=${date}&end_date=${date}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.values && result.values.length > 0) {
        return { data: result.values[0], date };
      }
    } catch (err) {
      console.warn(`تلاش برای تاریخ ${date} با خطا مواجه شد`);
    }
  }

  throw new Error("داده‌ای در ۵ روز گذشته یافت نشد.");
}

async function fetchGoldData() {
  document.getElementById("results").innerHTML = "در حال بارگذاری اطلاعات...";

  try {
    const { data, date } = await fetchLatestAvailableData();

    const high = parseFloat(data.high);
    const low = parseFloat(data.low);
    const close = parseFloat(data.close);
    const open = parseFloat(data.open);

    const pp = (high + low + close + open) / 4;
    const r1 = (2 * pp) - low;
    const s1 = (2 * pp) - high;
    const r2 = pp + (high - low);
    const s2 = pp - (high - low);
    const r3 = high + 2 * (pp - low);
    const s3 = low - 2 * (high - pp);

    document.getElementById("results").innerHTML = `
      <h2>نقاط پیوت مودیفای (${date})</h2>
      <p>PP: ${pp.toFixed(2)}</p>
      <p>R1: ${r1.toFixed(2)}</p>
      <p>S1: ${s1.toFixed(2)}</p>
      <p>R2: ${r2.toFixed(2)}</p>
      <p>S2: ${s2.toFixed(2)}</p>
      <p>R3: ${r3.toFixed(2)}</p>
      <p>S3: ${s3.toFixed(2)}</p>
    `;
  } catch (error) {
    console.error("خطا:", error);
    document.getElementById("results").innerHTML = `<p style="color:red;">خطا در دریافت اطلاعات بازار طلا: ${error.message}</p>`;
  }
}

window.onload = fetchGoldData;
