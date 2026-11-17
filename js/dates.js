window.VP = window.VP || {};

(function (VP) {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function key(y, m, d) {
    return y + "-" + pad(m) + "-" + pad(d);
  }

  function fromDate(date) {
    return key(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }

  function parse(keyStr) {
    const [y, m, d] = keyStr.split("-").map(Number);
    return { y, m, d };
  }

  function toUtc(keyStr) {
    const { y, m, d } = parse(keyStr);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function addDays(keyStr, days) {
    const dt = toUtc(keyStr);
    dt.setUTCDate(dt.getUTCDate() + days);
    return fromDate(dt);
  }

  function dayOfWeek(keyStr) {
    return toUtc(keyStr).getUTCDay(); // 0=Sun
  }

  function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function dayCount(year) {
    return isLeap(year) ? 366 : 365;
  }

  function firstOfYear(year) {
    return key(year, 1, 1);
  }

  function dateAt(year, index) {
    return addDays(firstOfYear(year), index);
  }

  function indexOf(year, keyStr) {
    const a = toUtc(firstOfYear(year));
    const b = toUtc(keyStr);
    return Math.round((b - a) / 86400000);
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function todayKey() {
    const now = new Date();
    return key(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function formatLong(keyStr) {
    const dt = toUtc(keyStr);
    return dt.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function monthName(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
      month: "long",
      timeZone: "UTC"
    });
  }

  /** ISO-8601 week number (Monday-based). */
  function isoWeek(keyStr) {
    const dt = toUtc(keyStr);
    const dayNum = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    return Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  }

  function eachDay(startKey, endKey, fn) {
    let cur = startKey;
    while (compare(cur, endKey) <= 0) {
      fn(cur);
      cur = addDays(cur, 1);
    }
  }

  VP.Dates = {
    key,
    fromDate,
    parse,
    addDays,
    dayOfWeek,
    compare,
    isLeap,
    dayCount,
    firstOfYear,
    dateAt,
    indexOf,
    daysInMonth,
    todayKey,
    formatLong,
    monthName,
    isoWeek,
    eachDay,
    tryParse(keyStr) {
      return /^\d{4}-\d{2}-\d{2}$/.test(keyStr) ? keyStr : null;
    }
  };
})(window.VP);
