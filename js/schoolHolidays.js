window.VP = window.VP || {};

(function (VP) {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDate(y, m, d) {
    return y + "-" + pad(m) + "-" + pad(d);
  }

  function span(y1, m1, d1, y2, m2, d2, name) {
    return { start: formatDate(y1, m1, d1), end: formatDate(y2, m2, d2), name: name };
  }

  function day(y, m, d, name) {
    return span(y, m, d, y, m, d, name);
  }

  var data = {
    BW: [
      span(2025, 12, 22, 2026, 1, 5, "Christmas holiday"),
      span(2026, 3, 30, 2026, 4, 11, "Easter holiday"),
      span(2026, 5, 26, 2026, 6, 5, "Pentecost holiday"),
      span(2026, 7, 30, 2026, 9, 12, "Summer holiday"),
      span(2026, 10, 26, 2026, 10, 31, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 9, "Christmas holiday")
    ],
    BY: [
      span(2025, 12, 22, 2026, 1, 5, "Christmas holiday"),
      span(2026, 2, 16, 2026, 2, 20, "Winter holiday"),
      span(2026, 3, 30, 2026, 4, 10, "Easter holiday"),
      span(2026, 5, 26, 2026, 6, 5, "Pentecost holiday"),
      span(2026, 8, 3, 2026, 9, 14, "Summer holiday"),
      span(2026, 11, 2, 2026, 11, 6, "Autumn holiday"),
      day(2026, 11, 18, "School-free day"),
      span(2026, 12, 24, 2027, 1, 8, "Christmas holiday")
    ],
    BE: [
      span(2025, 12, 22, 2026, 1, 2, "Christmas holiday"),
      span(2026, 2, 2, 2026, 2, 7, "Winter holiday"),
      span(2026, 3, 30, 2026, 4, 10, "Easter holiday"),
      day(2026, 5, 15, "School-free day"),
      day(2026, 5, 26, "Pentecost holiday"),
      span(2026, 7, 9, 2026, 8, 22, "Summer holiday"),
      span(2026, 10, 19, 2026, 10, 31, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 2, "Christmas holiday")
    ],
    BB: [
      span(2025, 12, 22, 2026, 1, 2, "Christmas holiday"),
      span(2026, 2, 2, 2026, 2, 7, "Winter holiday"),
      span(2026, 3, 30, 2026, 4, 10, "Easter holiday"),
      day(2026, 5, 26, "Pentecost holiday"),
      span(2026, 7, 9, 2026, 8, 22, "Summer holiday"),
      span(2026, 10, 19, 2026, 10, 30, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 2, "Christmas holiday")
    ],
    HB: [
      span(2025, 12, 22, 2026, 1, 5, "Christmas holiday"),
      span(2026, 2, 2, 2026, 2, 3, "Winter holiday"),
      span(2026, 3, 23, 2026, 4, 7, "Easter holiday"),
      day(2026, 5, 15, "School-free day"),
      day(2026, 5, 26, "Pentecost holiday"),
      span(2026, 7, 2, 2026, 8, 12, "Summer holiday"),
      span(2026, 10, 12, 2026, 10, 24, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 9, "Christmas holiday")
    ],
    HH: [
      span(2025, 12, 17, 2026, 1, 2, "Christmas holiday"),
      day(2026, 1, 30, "Winter holiday"),
      span(2026, 3, 2, 2026, 3, 13, "Spring holiday"),
      span(2026, 5, 11, 2026, 5, 15, "Pentecost holiday"),
      span(2026, 7, 9, 2026, 8, 19, "Summer holiday"),
      span(2026, 10, 19, 2026, 10, 30, "Autumn holiday"),
      span(2026, 12, 21, 2027, 1, 1, "Christmas holiday")
    ],
    HE: [
      span(2025, 12, 22, 2026, 1, 10, "Christmas holiday"),
      span(2026, 3, 30, 2026, 4, 10, "Easter holiday"),
      span(2026, 6, 29, 2026, 8, 7, "Summer holiday"),
      span(2026, 10, 5, 2026, 10, 17, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 12, "Christmas holiday")
    ],
    MV: [
      span(2025, 12, 22, 2026, 1, 5, "Christmas holiday"),
      span(2026, 2, 9, 2026, 2, 20, "Winter holiday"),
      span(2026, 3, 30, 2026, 4, 8, "Easter holiday"),
      day(2026, 5, 15, "School-free day"),
      span(2026, 5, 22, 2026, 5, 26, "Pentecost holiday"),
      span(2026, 7, 13, 2026, 8, 22, "Summer holiday"),
      span(2026, 10, 19, 2026, 10, 24, "Autumn holiday"),
      span(2026, 11, 26, 2026, 11, 27, "Autumn holiday"),
      span(2026, 12, 19, 2027, 1, 2, "Christmas holiday")
    ],
    NI: [
      span(2025, 12, 22, 2026, 1, 5, "Christmas holiday"),
      span(2026, 2, 2, 2026, 2, 3, "Winter holiday"),
      span(2026, 3, 23, 2026, 4, 7, "Easter holiday"),
      day(2026, 5, 15, "School-free day"),
      day(2026, 5, 26, "Pentecost holiday"),
      span(2026, 7, 2, 2026, 8, 12, "Summer holiday"),
      span(2026, 10, 12, 2026, 10, 24, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 9, "Christmas holiday")
    ],
    NW: [
      span(2025, 12, 22, 2026, 1, 6, "Christmas holiday"),
      span(2026, 3, 30, 2026, 4, 11, "Easter holiday"),
      day(2026, 5, 26, "Pentecost holiday"),
      span(2026, 7, 20, 2026, 9, 1, "Summer holiday"),
      span(2026, 10, 17, 2026, 10, 31, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 6, "Christmas holiday")
    ],
    RP: [
      span(2025, 12, 22, 2026, 1, 7, "Christmas holiday"),
      span(2026, 3, 30, 2026, 4, 10, "Easter holiday"),
      span(2026, 6, 29, 2026, 8, 7, "Summer holiday"),
      span(2026, 10, 5, 2026, 10, 16, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 8, "Christmas holiday")
    ],
    SL: [
      span(2025, 12, 22, 2026, 1, 2, "Christmas holiday"),
      span(2026, 2, 16, 2026, 2, 20, "Winter holiday"),
      span(2026, 4, 7, 2026, 4, 17, "Easter holiday"),
      span(2026, 6, 29, 2026, 8, 7, "Summer holiday"),
      span(2026, 10, 5, 2026, 10, 16, "Autumn holiday"),
      span(2026, 12, 21, 2026, 12, 31, "Christmas holiday")
    ],
    SN: [
      span(2025, 12, 22, 2026, 1, 2, "Christmas holiday"),
      span(2026, 2, 9, 2026, 2, 21, "Winter holiday"),
      span(2026, 4, 3, 2026, 4, 10, "Easter holiday"),
      day(2026, 5, 15, "School-free day"),
      span(2026, 7, 4, 2026, 8, 14, "Summer holiday"),
      span(2026, 10, 12, 2026, 10, 24, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 2, "Christmas holiday")
    ],
    ST: [
      span(2025, 12, 22, 2026, 1, 5, "Christmas holiday"),
      span(2026, 1, 31, 2026, 2, 6, "Winter holiday"),
      span(2026, 3, 30, 2026, 4, 4, "Easter holiday"),
      span(2026, 5, 26, 2026, 5, 29, "Pentecost holiday"),
      span(2026, 7, 4, 2026, 8, 14, "Summer holiday"),
      span(2026, 10, 19, 2026, 10, 30, "Autumn holiday"),
      span(2026, 12, 21, 2027, 1, 2, "Christmas holiday")
    ],
    SH: [
      span(2025, 12, 19, 2026, 1, 6, "Christmas holiday"),
      span(2026, 3, 26, 2026, 4, 10, "Easter holiday"),
      day(2026, 5, 15, "Pentecost holiday"),
      span(2026, 7, 4, 2026, 8, 15, "Summer holiday"),
      span(2026, 10, 12, 2026, 10, 24, "Autumn holiday"),
      span(2026, 12, 21, 2027, 1, 6, "Christmas holiday")
    ],
    TH: [
      span(2025, 12, 22, 2026, 1, 3, "Christmas holiday"),
      span(2026, 2, 16, 2026, 2, 21, "Winter holiday"),
      span(2026, 4, 7, 2026, 4, 17, "Easter holiday"),
      day(2026, 5, 15, "Pentecost holiday"),
      span(2026, 7, 4, 2026, 8, 14, "Summer holiday"),
      span(2026, 10, 12, 2026, 10, 24, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 2, "Christmas holiday")
    ],
    ES_NA: [
      span(2025, 12, 20, 2026, 1, 7, "Christmas holiday"),
      span(2026, 4, 2, 2026, 4, 12, "Easter holiday"),
      span(2026, 6, 20, 2026, 8, 31, "Summer holiday"),
      span(2026, 12, 23, 2027, 1, 10, "Christmas holiday")
    ],
    CZ_PL: [
      span(2025, 12, 22, 2026, 1, 2, "Christmas holiday"),
      day(2026, 1, 30, "Semester holiday"),
      span(2026, 3, 2, 2026, 3, 8, "Spring holiday"),
      day(2026, 4, 2, "Easter holiday"),
      span(2026, 7, 1, 2026, 8, 31, "Summer holiday"),
      span(2026, 10, 29, 2026, 10, 30, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 3, "Christmas holiday")
    ],
    SK_BA: [
      span(2025, 12, 22, 2026, 1, 7, "Christmas holiday"),
      day(2026, 2, 2, "Semester holiday"),
      span(2026, 2, 16, 2026, 2, 20, "Spring holiday"),
      span(2026, 4, 2, 2026, 4, 7, "Easter holiday"),
      span(2026, 7, 1, 2026, 8, 31, "Summer holiday"),
      span(2026, 10, 29, 2026, 10, 30, "Autumn holiday"),
      span(2026, 12, 23, 2027, 1, 7, "Christmas holiday")
    ],
    FR_PA: [
      span(2025, 12, 21, 2026, 1, 4, "Christmas holiday"),
      span(2026, 2, 21, 2026, 3, 8, "Winter holiday"),
      span(2026, 4, 18, 2026, 5, 3, "Spring holiday"),
      span(2026, 7, 4, 2026, 8, 31, "Summer holiday"),
      span(2026, 10, 17, 2026, 11, 1, "All Saints holiday"),
      span(2026, 12, 19, 2027, 1, 3, "Christmas holiday")
    ]
  };

  VP.SchoolHolidays = {
    for: function (code) {
      if (code != null && Object.prototype.hasOwnProperty.call(data, code)) {
        return data[code];
      }
      return [];
    }
  };
})(window.VP);