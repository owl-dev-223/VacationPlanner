window.VP = window.VP || {};

(function (VP) {
  const GERMAN = new Set([
    "BW",
    "BY",
    "BE",
    "BB",
    "HB",
    "HH",
    "HE",
    "MV",
    "NI",
    "NW",
    "RP",
    "SL",
    "SN",
    "ST",
    "SH",
    "TH"
  ]);

  const ALL = [
    { code: "BW", label: "D: Baden-Württemberg" },
    { code: "BY", label: "D: Bavaria" },
    { code: "BE", label: "D: Berlin" },
    { code: "BB", label: "D: Brandenburg" },
    { code: "HB", label: "D: Bremen" },
    { code: "HH", label: "D: Hamburg" },
    { code: "HE", label: "D: Hessen" },
    { code: "MV", label: "D: Mecklenburg-Vorpommern" },
    { code: "NI", label: "D: Niedersachsen" },
    { code: "NW", label: "D: Nordrhein-Westfalen" },
    { code: "RP", label: "D: Rheinland-Pfalz" },
    { code: "SL", label: "D: Saarland" },
    { code: "SN", label: "D: Sachsen" },
    { code: "ST", label: "D: Sachsen-Anhalt" },
    { code: "SH", label: "D: Schleswig-Holstein" },
    { code: "TH", label: "D: Thüringen" },
    { code: "IN", label: "Indien" },
    { code: "ES_NA", label: "ES: Navarra" },
    { code: "CZ_PL", label: "CZ: Plzeň" },
    { code: "SK_BA", label: "SK: Region Bratislava" },
    { code: "FR_PA", label: "FR: Region Paris" }
  ];

  VP.Regions = {
    all: ALL,
    find(code) {
      return ALL.find((r) => r.code === code) || null;
    },
    isGerman(code) {
      return GERMAN.has(code);
    }
  };
})(window.VP);
