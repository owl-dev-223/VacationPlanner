window.VP = window.VP || {};

(function (VP) {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDate(y, m, d) {
    return y + "-" + pad(m) + "-" + pad(d);
  }

  function addDays(dateStr, days) {
    const parts = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    dt.setUTCDate(dt.getUTCDate() + days);
    return formatDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }

  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return formatDate(year, month, day);
  }

  /** Buß- und Bettag: the Wednesday before 23 November. */
  function repentanceDay(year) {
    let dt = new Date(Date.UTC(year, 10, 22));
    while (dt.getUTCDay() !== 3) {
      dt.setUTCDate(dt.getUTCDate() - 1);
    }
    return formatDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }

  function germanGet(code, year) {
    const easter = easterSunday(year);
    const list = [{ date: formatDate(year, 1, 1), name: "New Year's Day" }];

    if (code === "BW" || code === "BY" || code === "ST") {
      list.push({ date: formatDate(year, 1, 6), name: "Epiphany" });
    }
    if (code === "BE" || code === "MV") {
      list.push({ date: formatDate(year, 3, 8), name: "International Women's Day" });
    }

    list.push({ date: addDays(easter, -2), name: "Good Friday" });
    list.push({ date: addDays(easter, 1), name: "Easter Monday" });
    list.push({ date: formatDate(year, 5, 1), name: "Labour Day" });
    list.push({ date: addDays(easter, 39), name: "Ascension Day" });
    list.push({ date: addDays(easter, 50), name: "Whit Monday" });

    if (code === "BW" || code === "BY" || code === "HE" || code === "NW" || code === "RP" || code === "SL") {
      list.push({ date: addDays(easter, 60), name: "Corpus Christi" });
    }

    if (code === "SL") {
      list.push({ date: formatDate(year, 8, 15), name: "Assumption of Mary" });
    } else if (code === "BY") {
      list.push({
        date: formatDate(year, 8, 15),
        name: "Assumption of Mary (Catholic municipalities)"
      });
    }

    if (code === "TH") {
      list.push({ date: formatDate(year, 9, 20), name: "World Children's Day" });
    }

    list.push({ date: formatDate(year, 10, 3), name: "German Unity Day" });

    if (
      code === "BB" ||
      code === "HB" ||
      code === "HH" ||
      code === "MV" ||
      code === "NI" ||
      code === "SN" ||
      code === "ST" ||
      code === "SH" ||
      code === "TH"
    ) {
      list.push({ date: formatDate(year, 10, 31), name: "Reformation Day" });
    }
    if (code === "BW" || code === "BY" || code === "NW" || code === "RP" || code === "SL") {
      list.push({ date: formatDate(year, 11, 1), name: "All Saints' Day" });
    }
    if (code === "SN") {
      list.push({ date: repentanceDay(year), name: "Repentance and Prayer Day" });
    }

    list.push({ date: formatDate(year, 12, 25), name: "Christmas Day" });
    list.push({ date: formatDate(year, 12, 26), name: "Second Day of Christmas" });
    return list;
  }

  function indiaGet(year) {
    const list = [
      { date: formatDate(year, 1, 26), name: "Republic Day" },
      { date: formatDate(year, 8, 15), name: "Independence Day" },
      { date: formatDate(year, 10, 2), name: "Mahatma Gandhi's Birthday" },
      { date: formatDate(year, 12, 25), name: "Christmas Day" }
    ];

    if (year === 2026) {
      list.push(
        { date: "2026-03-04", name: "Holi" },
        { date: "2026-03-21", name: "Id-ul-Fitr" },
        { date: "2026-03-26", name: "Ram Navami" },
        { date: "2026-03-31", name: "Mahavir Jayanti" },
        { date: "2026-04-03", name: "Good Friday" },
        { date: "2026-05-01", name: "Buddha Purnima" },
        { date: "2026-05-27", name: "Id-ul-Zuha" },
        { date: "2026-06-26", name: "Muharram" },
        { date: "2026-08-26", name: "Id-e-Milad" },
        { date: "2026-09-04", name: "Janmashtami" },
        { date: "2026-10-20", name: "Dussehra" },
        { date: "2026-11-08", name: "Diwali" },
        { date: "2026-11-24", name: "Guru Nanak's Birthday" }
      );
    }

    return sortHolidays(list);
  }

  /** If All Saints' Day (1 Nov) falls on Sunday, Navarra observes the Monday. */
  function navarraAllSaints(year) {
    const nov1 = new Date(Date.UTC(year, 10, 1));
    if (nov1.getUTCDay() === 0) return formatDate(year, 11, 2);
    return formatDate(year, 11, 1);
  }

  function spainNavarraGet(year) {
    const easter = easterSunday(year);
    return sortHolidays([
      { date: formatDate(year, 1, 1), name: "New Year's Day" },
      { date: formatDate(year, 1, 6), name: "Epiphany" },
      { date: formatDate(year, 3, 19), name: "Saint Joseph's Day" },
      { date: addDays(easter, -3), name: "Maundy Thursday" },
      { date: addDays(easter, -2), name: "Good Friday" },
      { date: addDays(easter, 1), name: "Easter Monday" },
      { date: formatDate(year, 5, 1), name: "Labour Day" },
      { date: formatDate(year, 8, 15), name: "Assumption" },
      { date: formatDate(year, 10, 12), name: "National Day of Spain" },
      { date: navarraAllSaints(year), name: "All Saints' Day" },
      { date: formatDate(year, 12, 3), name: "Saint Francis Xavier" },
      { date: formatDate(year, 12, 8), name: "Immaculate Conception" },
      { date: formatDate(year, 12, 25), name: "Christmas Day" }
    ]);
  }

  function czechGet(year) {
    const easter = easterSunday(year);
    return sortHolidays([
      { date: formatDate(year, 1, 1), name: "New Year's Day" },
      { date: addDays(easter, -2), name: "Good Friday" },
      { date: addDays(easter, 1), name: "Easter Monday" },
      { date: formatDate(year, 5, 1), name: "Labour Day" },
      { date: formatDate(year, 5, 8), name: "Liberation Day" },
      { date: formatDate(year, 7, 5), name: "Saints Cyril and Methodius Day" },
      { date: formatDate(year, 7, 6), name: "Jan Hus Day" },
      { date: formatDate(year, 9, 28), name: "Czech Statehood Day" },
      { date: formatDate(year, 10, 28), name: "Independence Day" },
      { date: formatDate(year, 11, 17), name: "Struggle for Freedom and Democracy Day" },
      { date: formatDate(year, 12, 24), name: "Christmas Eve" },
      { date: formatDate(year, 12, 25), name: "Christmas Day" },
      { date: formatDate(year, 12, 26), name: "St. Stephen's Day" }
    ]);
  }

  function slovakiaGet(year) {
    const easter = easterSunday(year);
    return sortHolidays([
      { date: formatDate(year, 1, 1), name: "Day of the Establishment of the Slovak Republic" },
      { date: formatDate(year, 1, 6), name: "Epiphany" },
      { date: addDays(easter, -2), name: "Good Friday" },
      { date: addDays(easter, 1), name: "Easter Monday" },
      { date: formatDate(year, 5, 1), name: "Labour Day" },
      { date: formatDate(year, 7, 5), name: "St. Cyril and St. Methodius Day" },
      { date: formatDate(year, 8, 29), name: "Slovak National Uprising Day" },
      { date: formatDate(year, 11, 1), name: "All Saints' Day" },
      { date: formatDate(year, 12, 24), name: "Christmas Eve" },
      { date: formatDate(year, 12, 25), name: "Christmas Day" },
      { date: formatDate(year, 12, 26), name: "Boxing Day" }
    ]);
  }

  function franceGet(year) {
    const easter = easterSunday(year);
    return sortHolidays([
      { date: formatDate(year, 1, 1), name: "New Year's Day" },
      { date: addDays(easter, 1), name: "Easter Monday" },
      { date: formatDate(year, 5, 1), name: "Labour Day" },
      { date: formatDate(year, 5, 8), name: "Victory in Europe Day" },
      { date: addDays(easter, 39), name: "Ascension Day" },
      { date: addDays(easter, 50), name: "Whit Monday" },
      { date: formatDate(year, 7, 14), name: "Bastille Day" },
      { date: formatDate(year, 8, 15), name: "Assumption" },
      { date: formatDate(year, 11, 1), name: "All Saints' Day" },
      { date: formatDate(year, 11, 11), name: "Armistice Day" },
      { date: formatDate(year, 12, 25), name: "Christmas Day" }
    ]);
  }

  function sortHolidays(list) {
    list.sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
    return list;
  }

  function holidaysFor(code, year) {
    if (VP.Regions.isGerman(code)) return germanGet(code, year);
    switch (code) {
      case "IN":
        return indiaGet(year);
      case "ES_NA":
        return spainNavarraGet(year);
      case "CZ_PL":
        return czechGet(year);
      case "SK_BA":
        return slovakiaGet(year);
      case "FR_PA":
        return franceGet(year);
      default:
        return [];
    }
  }

  VP.GermanHolidays = {
    easterSunday: easterSunday,
    repentanceDay: repentanceDay,
    get: germanGet
  };

  VP.IndiaHolidays = {
    get: indiaGet
  };

  VP.SpainNavarraHolidays = { get: spainNavarraGet };
  VP.CzechHolidays = { get: czechGet };
  VP.SlovakiaHolidays = { get: slovakiaGet };
  VP.FranceHolidays = { get: franceGet };
  VP.Holidays = { for: holidaysFor };
})(window.VP);