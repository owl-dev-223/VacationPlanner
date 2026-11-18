window.VP = window.VP || {};

(function (VP) {
  function drawCentered(ctx, text, x, y, w, h, font, color) {
    if (w < 2 || h < 2 || !text) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2, Math.max(1, w - 2));
    ctx.restore();
  }

  function drawLeft(ctx, text, x, y, w, h, font, color, pad) {
    pad = pad == null ? 6 : pad;
    if (w < 2 || !text) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + pad, y + h / 2, Math.max(1, w - pad - 4));
    ctx.restore();
  }

  function renderCorner(ctx, layout) {
    const P = VP.Palette;
    const w = layout.frozenWidth;
    const h = layout.headerHeight;
    const weekTop = layout.monthBand;
    const dayTop = layout.monthBand + layout.weekBand;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = P.white;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = P.grid;
    ctx.beginPath();
    ctx.moveTo(0, weekTop + 0.5);
    ctx.lineTo(w, weekTop + 0.5);
    ctx.moveTo(0, dayTop + 0.5);
    ctx.lineTo(w, dayTop + 0.5);
    ctx.moveTo(0, h - 0.5);
    ctx.lineTo(w, h - 0.5);
    ctx.stroke();

    let x = layout.handleWidth + layout.nameWidth;
    const font = "600 11px Segoe UI, system-ui, sans-serif";
    drawCentered(ctx, "Start", x, dayTop, layout.startWidth, layout.dayBand, font, P.muted);
    x += layout.startWidth;
    drawCentered(ctx, "Planned", x, dayTop, layout.plannedWidth, layout.dayBand, font, P.muted);
    x += layout.plannedWidth;
    drawCentered(ctx, "Open", x, dayTop, layout.openWidth, layout.dayBand, font, P.muted);
    drawFrozenVerticals(ctx, layout, h);
  }

  function renderDayHeader(ctx, model, layout) {
    const P = VP.Palette;
    const w = layout.bodyWidth;
    const h = layout.headerHeight;
    const weekTop = layout.monthBand;
    const dayTop = layout.monthBand + layout.weekBand;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = P.white;
    ctx.fillRect(0, 0, w, h);
    const today = VP.Dates.todayKey();

    let month = 1;
    while (month <= 12) {
      const days = VP.Dates.daysInMonth(layout.year, month);
      const index = VP.Dates.indexOf(layout.year, VP.Dates.key(layout.year, month, 1));
      const rectX = index * layout.dayWidth;
      const rectW = days * layout.dayWidth;
      drawCentered(
        ctx,
        VP.Dates.monthName(layout.year, month),
        rectX,
        0,
        rectW,
        layout.monthBand,
        "600 13px Segoe UI, system-ui, sans-serif",
        P.ink
      );
      ctx.strokeStyle = P.month;
      ctx.beginPath();
      ctx.moveTo(rectX + 0.5, 0);
      ctx.lineTo(rectX + 0.5, h);
      ctx.stroke();
      month++;
    }

    ctx.strokeStyle = P.grid;
    ctx.beginPath();
    ctx.moveTo(0, weekTop + 0.5);
    ctx.lineTo(w, weekTop + 0.5);
    ctx.moveTo(0, dayTop + 0.5);
    ctx.lineTo(w, dayTop + 0.5);
    ctx.stroke();

    let weekStart = 0;
    while (weekStart < layout.dayCount) {
      const week = VP.Dates.isoWeek(layout.dateAt(weekStart));
      let weekEnd = weekStart + 1;
      while (weekEnd < layout.dayCount && VP.Dates.isoWeek(layout.dateAt(weekEnd)) === week) {
        weekEnd++;
      }
      const rectX = weekStart * layout.dayWidth;
      const rectW = (weekEnd - weekStart) * layout.dayWidth;
      drawCentered(
        ctx,
        "week" + week,
        rectX,
        weekTop,
        rectW,
        layout.weekBand,
        "600 11px Segoe UI, system-ui, sans-serif",
        P.muted
      );
      if (weekStart > 0) {
        ctx.strokeStyle = P.grid;
        ctx.beginPath();
        ctx.moveTo(rectX + 0.5, weekTop);
        ctx.lineTo(rectX + 0.5, dayTop);
        ctx.stroke();
      }
      weekStart = weekEnd;
    }

    for (let day = 0; day < layout.dayCount; day++) {
      const date = layout.dateAt(day);
      const dow = VP.Dates.dayOfWeek(date);
      const weekend = dow === 0 || dow === 6;
      const x = day * layout.dayWidth;
      const y = dayTop;
      if (weekend) {
        ctx.fillStyle = P.weekend;
        ctx.fillRect(x, y, layout.dayWidth, layout.dayBand);
      }
      if (model.hoverDay === day) {
        ctx.fillStyle = P.headerHover;
        ctx.fillRect(x, y, layout.dayWidth, layout.dayBand);
      }
      const isToday = date === today;
      const { d } = VP.Dates.parse(date);
      drawCentered(
        ctx,
        String(d),
        x,
        y,
        layout.dayWidth,
        layout.dayBand,
        (isToday ? "700 " : "400 ") + "11px Segoe UI, system-ui, sans-serif",
        isToday ? P.today : weekend ? P.muted : P.ink
      );
      if (isToday) {
        ctx.strokeStyle = P.today;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + layout.dayBand - 2);
        ctx.lineTo(x + layout.dayWidth - 2, y + layout.dayBand - 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      ctx.strokeStyle = P.grid;
      ctx.beginPath();
      ctx.moveTo(x + layout.dayWidth + 0.5, y);
      ctx.lineTo(x + layout.dayWidth + 0.5, h);
      ctx.stroke();
    }

    ctx.strokeStyle = P.grid;
    ctx.beginPath();
    ctx.moveTo(0, h - 0.5);
    ctx.lineTo(w, h - 0.5);
    ctx.stroke();
  }

  function renderRowHeader(ctx, model, layout) {
    const P = VP.Palette;
    const doc = model.document;
    const rows = doc.rows;
    const active = doc.activeIndexes();
    const w = layout.frozenWidth;
    const h = layout.bodyHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = P.white;
    ctx.fillRect(0, 0, w, h);
    const font = layout.rowFont + "px Segoe UI, system-ui, sans-serif";

    for (let view = 0; view <= active.length; view++) {
      const add = view === active.length;
      const rowIndex = add ? -1 : active[view];
      const row = add ? null : rows[rowIndex];
      const region = !!(row && row.isRegion);
      const y = view * layout.rowHeight;

      if (add) {
        drawLeft(ctx, "+ add user / region", 0, y, w, layout.rowHeight, "italic " + font, P.addText);
      } else {
        let fill = null;
        if (model.dragFrom === rowIndex) fill = P.dragRow;
        else if (model.selectedRow === rowIndex) fill = P.selectedRow;
        else if (region) fill = P.region;
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fillRect(0, y, w, layout.rowHeight);
        }

        drawGrip(ctx, y, layout.rowHeight);
        drawLeft(
          ctx,
          VP.nameFor(row, doc.year),
          layout.handleWidth,
          y,
          layout.nameWidth,
          layout.rowHeight,
          (region ? "600 italic " : "400 ") + font,
          P.ink
        );

        if (!region) {
          const regionCode = VP.LeaveMath.effectiveRegion(rows, rowIndex);
          const planned = VP.LeaveMath.countPlanned(row, doc.year, regionCode);
          const open = VP.LeaveMath.openDays(row, planned, doc.year);
          const startDays = VP.startDaysFor(row, doc.year);
          let x = layout.handleWidth + layout.nameWidth;
          if (model.hoverRow === rowIndex && model.hoverKind === "start") {
            ctx.fillStyle = P.startHover;
            ctx.fillRect(x, y, layout.startWidth, layout.rowHeight);
          }
          drawCentered(ctx, String(startDays), x, y, layout.startWidth, layout.rowHeight, font, P.ink);
          x += layout.startWidth;
          drawCentered(ctx, VP.LeaveMath.formatDays(planned), x, y, layout.plannedWidth, layout.rowHeight, font, P.muted);
          x += layout.plannedWidth;
          const openColor = open < 0 ? P.openNegative : open > 0 ? P.openPositive : P.muted;
          drawCentered(ctx, VP.LeaveMath.formatDays(open), x, y, layout.openWidth, layout.rowHeight, "600 " + font, openColor);
        }
      }

      ctx.strokeStyle = P.grid;
      ctx.beginPath();
      ctx.moveTo(0, y + layout.rowHeight + 0.5);
      ctx.lineTo(w, y + layout.rowHeight + 0.5);
      ctx.stroke();
    }

    drawFrozenVerticals(ctx, layout, h);

    if (model.dragInsert != null) {
      const y = model.dragInsert * layout.rowHeight;
      ctx.strokeStyle = P.selectStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  function viewOf(doc, realIndex) {
    return doc.activeIndexes().indexOf(realIndex);
  }

  function renderDayBody(ctx, model, layout) {
    const P = VP.Palette;
    const doc = model.document;
    const rows = doc.rows;
    const active = doc.activeIndexes();
    const w = layout.bodyWidth;
    const h = layout.bodyHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = P.white;
    ctx.fillRect(0, 0, w, h);
    const today = VP.Dates.todayKey();

    for (let view = 0; view <= active.length; view++) {
      const add = view === active.length;
      const rowIndex = add ? -1 : active[view];
      const row = add ? null : rows[rowIndex];
      const region = !!(row && row.isRegion);
      const regionCode = add ? null : VP.LeaveMath.effectiveRegion(rows, rowIndex);
      const cal = VP.YearCalendar.for(regionCode, doc.year);
      const y = view * layout.rowHeight;

      for (let day = 0; day < layout.dayCount; day++) {
        const date = layout.dateAt(day);
        const dow = VP.Dates.dayOfWeek(date);
        const weekend = dow === 0 || dow === 6;
        const bank = !add && VP.YearCalendar.isBank(cal, date);
        const school = !add && VP.YearCalendar.isSchool(cal, date);
        const x = day * layout.dayWidth;
        if (add) continue;

        if (region) {
          ctx.fillStyle = bank ? P.bank : school ? P.school : P.region;
          ctx.fillRect(x, y, layout.dayWidth, layout.rowHeight);
          continue;
        }

        let status = "working";
        if (row.marks && row.marks[date]) status = row.marks[date];
        const nonWorkingBg = bank || weekend;
        if (status === "working" || nonWorkingBg) {
          ctx.fillStyle = bank ? P.bank : weekend ? P.weekend : P.white;
          ctx.fillRect(x, y, layout.dayWidth, layout.rowHeight);
        } else {
          ctx.fillStyle = P.forStatus(status);
          ctx.fillRect(x, y, layout.dayWidth, layout.rowHeight);
        }
        if (status !== "working") {
          const letter = VP.LeaveMath.cellLabel(status, date, regionCode);
          if (letter) {
            const fontSize = Math.max(
              8,
              Math.min(letter.length > 1 ? 11 : 14, Math.round(layout.rowHeight * (letter.length > 1 ? 0.42 : 0.55)))
            );
            drawCentered(
              ctx,
              letter,
              x,
              y,
              layout.dayWidth,
              layout.rowHeight,
              "700 " + fontSize + "px Segoe UI, system-ui, sans-serif",
              nonWorkingBg ? P.ink : P.inkFor(status)
            );
          }
        }

        if (date === today) {
          ctx.strokeStyle = P.today;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 1, y + 1);
          ctx.lineTo(x + layout.dayWidth - 1, y + 1);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
    }

    ctx.strokeStyle = P.grid;
    for (let view = 0; view <= active.length + 1; view++) {
      const y = view * layout.rowHeight + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    for (let day = 0; day <= layout.dayCount; day++) {
      const x = day * layout.dayWidth + 0.5;
      const month =
        day === layout.dayCount || VP.Dates.parse(layout.dateAt(Math.min(day, layout.dayCount - 1))).d === 1;
      ctx.strokeStyle = month ? P.month : P.grid;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    if (model.hasDaySelection()) {
      const viewRow = viewOf(doc, model.selectionRow);
      if (viewRow >= 0) {
        const range = model.range();
        const first = layout.indexOf(range.start);
        const last = layout.indexOf(range.end);
        const x = first * layout.dayWidth + 1.5;
        const y = viewRow * layout.rowHeight + 1.5;
        const rw = (last - first + 1) * layout.dayWidth - 3;
        const rh = layout.rowHeight - 3;
        ctx.fillStyle = P.selectFill;
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeStyle = P.selectStroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, rw, rh);
        ctx.lineWidth = 1;
      }
    }

    if (
      model.hoverRow != null &&
      model.hoverDay != null &&
      model.hoverDay >= 0 &&
      model.hoverDay < layout.dayCount &&
      !model.contains(model.hoverRow, layout.dateAt(model.hoverDay))
    ) {
      const viewRow = viewOf(doc, model.hoverRow);
      if (viewRow >= 0) {
        const x = model.hoverDay * layout.dayWidth + 1.5;
        const y = viewRow * layout.rowHeight + 1.5;
        ctx.strokeStyle = P.hover;
        ctx.strokeRect(x, y, layout.dayWidth - 3, layout.rowHeight - 3);
      }
    }

    if (model.dragInsert != null) {
      const y = model.dragInsert * layout.rowHeight;
      ctx.strokeStyle = P.selectStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  function drawGrip(ctx, y, rowHeight) {
    const P = VP.Palette;
    const cx = VP.GridLayout.HANDLE / 2;
    const cy = y + rowHeight / 2;
    ctx.fillStyle = P.grip;
    for (let i = -1; i <= 1; i++) {
      const gy = cy + i * 4;
      ctx.beginPath();
      ctx.arc(cx - 3, gy, 1.4, 0, Math.PI * 2);
      ctx.arc(cx + 3, gy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFrozenVerticals(ctx, layout, height) {
    const P = VP.Palette;
    let x = 0;
    const lines = [
      layout.handleWidth,
      layout.nameWidth,
      layout.startWidth,
      layout.plannedWidth,
      layout.openWidth
    ];
    ctx.strokeStyle = P.grid;
    ctx.beginPath();
    ctx.moveTo(0.5, 0);
    ctx.lineTo(0.5, height);
    ctx.stroke();
    for (let i = 0; i < lines.length; i++) {
      x += lines[i];
      ctx.strokeStyle = i === lines.length - 1 ? P.month : P.grid;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
  }

  VP.Render = {
    corner: renderCorner,
    dayHeader: renderDayHeader,
    rowHeader: renderRowHeader,
    dayBody: renderDayBody
  };
})(window.VP);
