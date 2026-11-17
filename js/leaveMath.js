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

  function counts(status, date, regionCode) {
    return status === "dayOff" && isCountableDay(date, regionCode);
  }

  function countPlanned(row, year, regionCode) {
    if (row.isRegion) return 0;
    let count = 0;
    for (const [key, status] of Object.entries(row.marks || {})) {
      if (status !== "dayOff" || !VP.Dates.tryParse(key)) continue;
      if (VP.Dates.parse(key).y !== year) continue;
      if (counts(status, key, regionCode)) count++;
    }
    return count;
  }

  function openDays(row, planned, year) {
    const start = VP.startDaysFor ? VP.startDaysFor(row, year) : row.startDays | 0;
    return start - planned;
  }

  function describe(row, date, regionCode) {
    const cal = VP.YearCalendar.for(regionCode, VP.Dates.parse(date).y);
    let status = "working";
    if (!row.isRegion && row.marks && row.marks[date]) status = row.marks[date];
    return {
      date,
      status,
      bankHoliday: VP.YearCalendar.bankName(cal, date),
      schoolHoliday: VP.YearCalendar.schoolName(cal, date),
      countsAsPlanned: counts(status, date, regionCode)
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
        text += detail.countsAsPlanned ? " · counts toward planned" : " · not counted";
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
    counts,
    countPlanned,
    openDays,
    describe,
    statusLabel,
    formatTooltip
  };
})(window.VP);
