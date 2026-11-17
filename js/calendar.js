window.VP = window.VP || {};

(function (VP) {
  const cache = new Map();

  function build(code, year) {
    const bank = new Map();
    const school = new Map();
    if (!code) return { bank, school };

    const holidays = VP.Holidays.for(code, year);
    for (const h of holidays) bank.set(h.date, h.name);

    const first = VP.Dates.firstOfYear(year);
    const last = VP.Dates.key(year, 12, 31);
    for (const span of VP.SchoolHolidays.for(code)) {
      let start = span.start < first ? first : span.start;
      let end = span.end > last ? last : span.end;
      if (end < start) continue;
      VP.Dates.eachDay(start, end, (date) => {
        const existing = school.get(date);
        school.set(date, existing && !existing.includes(span.name) ? existing + " · " + span.name : existing || span.name);
      });
    }

    return { bank, school };
  }

  function forRegion(regionCode, year) {
    const code = regionCode || "";
    const key = code + "|" + year;
    if (!cache.has(key)) cache.set(key, build(code, year));
    return cache.get(key);
  }

  VP.YearCalendar = {
    for: forRegion,
    isBank(cal, date) {
      return cal.bank.has(date);
    },
    bankName(cal, date) {
      return cal.bank.get(date) || null;
    },
    isSchool(cal, date) {
      return cal.school.has(date);
    },
    schoolName(cal, date) {
      return cal.school.get(date) || null;
    },
    clearCache() {
      cache.clear();
    }
  };
})(window.VP);
