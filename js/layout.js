window.VP = window.VP || {};

(function (VP) {
  const HANDLE = 18;
  const NAME = 168;
  const START = 58;
  const PLANNED = 72;
  const OPEN = 54;

  function create(year, zoom, rowCount) {
    zoom = zoom || 1;
    const dayWidth = Math.max(14, Math.round(22 * zoom));
    const rowHeight = Math.max(20, Math.round(28 * zoom));
    const monthBand = 26;
    const weekBand = 20;
    const dayBand = 22;
    const frozenWidth = HANDLE + NAME + START + PLANNED + OPEN;
    const dayCount = VP.Dates.dayCount(year);
    return {
      year,
      zoom,
      rowCount,
      handleWidth: HANDLE,
      nameWidth: NAME,
      startWidth: START,
      plannedWidth: PLANNED,
      openWidth: OPEN,
      frozenWidth,
      dayWidth,
      rowHeight,
      monthBand,
      weekBand,
      dayBand,
      headerHeight: monthBand + weekBand + dayBand,
      rowFont: Math.min(16, Math.max(11, 13 * zoom)),
      dayCount,
      bodyWidth: dayCount * dayWidth,
      bodyHeight: (rowCount + 1) * rowHeight,
      first: VP.Dates.firstOfYear(year),
      dateAt(index) {
        return VP.Dates.dateAt(year, index);
      },
      indexOf(date) {
        return VP.Dates.indexOf(year, date);
      },
      tryHitDay(x, y) {
        const row = Math.floor(y / rowHeight);
        const day = Math.floor(x / dayWidth);
        const addRow = row === rowCount;
        if (x < 0 || y < 0 || day < 0 || day >= dayCount || row < 0 || row > rowCount) {
          return null;
        }
        return { row, day, addRow };
      },
      tryHitRow(x, y) {
        const row = Math.floor(y / rowHeight);
        const addRow = row === rowCount;
        if (y < 0 || row < 0 || row > rowCount) return null;
        let kind = "open";
        if (x < HANDLE) kind = "handle";
        else if (x < HANDLE + NAME) kind = "name";
        else if (x < HANDLE + NAME + START) kind = "start";
        else if (x < HANDLE + NAME + START + PLANNED) kind = "planned";
        else kind = "open";
        return { row, kind, addRow };
      }
    };
  }

  VP.GridLayout = { create, HANDLE, NAME, START, PLANNED, OPEN };
})(window.VP);
