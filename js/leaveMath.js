window.VP = window.VP || {};

(function (VP) {
  function regionRowAbove(rows, index) {
    for (let i = index - 1; i >= 0; i--) {
      if (rows[i].isRegion) return rows[i];
    }
    return null;
  }

  function effectiveRegion(rows, index) {
    if (index < 0 || index >= rows.length) return null;
    if (rows[index].isRegion) return rows[index].regionCode;
    return regionRowAbove(rows, index)?.regionCode || null;
  }

  function isCountableDay(date, regionCode) {
    const dow = VP.Dates.dayOfWeek(date);
    if (dow === 0 || dow === 6) return false;
    const cal = VP.YearCalendar.for(regionCode, VP.Dates.parse(date).y);
    return !VP.YearCalendar.isBank(cal, date);
  }

  /** Christmas Eve / New Year's Eve: half annual-leave day in German regions. */
  function isGermanHalfLeaveDay(date, regionCode) {
    if (!VP.Regions || !VP.Regions.isGerman(regionCode)) return false;
    const parts = VP.Dates.parse(date);
    return parts.m === 12 && (parts.d === 24 || parts.d === 31);
  }

  function leaveWeight(status, date, regionCode) {
    if (status !== "dayOff" || !isCountableDay(date, regionCode)) return 0;
    return isGermanHalfLeaveDay(date, regionCode) ? 0.5 : 1;
  }

  function counts(status, date, regionCode) {
    return leaveWeight(status, date, regionCode) > 0;
  }

  function countPlanned(row, year, regionCode) {
    if (row.isRegion) return 0;
    let count = 0;
    for (const [key, status] of Object.entries(row.marks || {})) {
      if (status !== "dayOff" || !VP.Dates.tryParse(key)) continue;
      if (VP.Dates.parse(key).y !== year) continue;
      count += leaveWeight(status, key, regionCode);
    }
    return Math.round(count * 2) / 2;
  }

  function openDays(row, planned, year) {
    const start = VP.startDaysFor ? VP.startDaysFor(row, year) : row.startDays | 0;
    return Math.round((start - planned) * 2) / 2;
  }

  function formatDays(value) {
    const n = Math.round(Number(value) * 2) / 2;
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  function cellLabel(status, date, regionCode) {
    if (status === "dayOff" && isGermanHalfLeaveDay(date, regionCode) && isCountableDay(date, regionCode)) {
      return "A/2";
    }
    return VP.Palette.letterFor(status);
  }

  function describe(row, date, regionCode) {
    const cal = VP.YearCalendar.for(regionCode, VP.Dates.parse(date).y);
    let status = "working";
    if (!row.isRegion && row.marks && row.marks[date]) status = row.marks[date];
    const weight = leaveWeight(status, date, regionCode);
    return {
      date,
      status,
      bankHoliday: VP.YearCalendar.bankName(cal, date),
      schoolHoliday: VP.YearCalendar.schoolName(cal, date),
      countsAsPlanned: weight > 0,
      leaveWeight: weight
    };
  }

  function statusLabel(status) {
    switch (status) {
      case "dayOff":
        return "Annual Leave";
      case "flextimeComp":
        return "Flextime Comp";
      case "shortTimeWork":
        return "Short-Time-Work";
      case "otherAbsence":
        return "Other absence";
      case "parentalLeave":
        return "parental leave";
      default:
        return "working day";
    }
  }

  function formatTooltip(detail, isRegion) {
    let text = VP.Dates.formatLong(detail.date) + "\n";
    if (isRegion) text += "Region calendar";
    else {
      text += statusLabel(detail.status);
      if (detail.status === "dayOff") {
        if (detail.leaveWeight === 0.5) text += " · counts as half day";
        else if (detail.countsAsPlanned) text += " · counts toward planned";
        else text += " · not counted";
      }
    }
    if (detail.bankHoliday) text += "\nBank holiday: " + detail.bankHoliday;
    if (detail.schoolHoliday) {
      text += "\n" + (isRegion ? "School holiday: " : "School holiday in this region: ");
      text += detail.schoolHoliday;
      if (!isRegion) text += " (not deducted)";
    }
    return text;
  }

  VP.LeaveMath = {
    regionRowAbove,
    effectiveRegion,
    isCountableDay,
    isGermanHalfLeaveDay,
    leaveWeight,
    counts,
    countPlanned,
    openDays,
    formatDays,
    cellLabel,
    describe,
    statusLabel,
    formatTooltip
  };
})(window.VP);
