window.VP = window.VP || {};

(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    yearLabel: $("yearLabel"),
    zoomLabel: $("zoomLabel"),
    undoBtn: $("undoBtn"),
    redoBtn: $("redoBtn"),
    corner: $("cornerCanvas"),
    dayHeader: $("dayHeaderCanvas"),
    rowHeader: $("rowHeaderCanvas"),
    dayBody: $("dayBodyCanvas"),
    headerScroll: $("headerScroll"),
    rowScroll: $("rowScroll"),
    bodyScroll: $("bodyScroll"),
    tooltip: $("tooltip"),
    contextMenu: $("contextMenu"),
    fileStatus: $("fileStatus"),
    openPlanBtn: $("openPlanBtn"),
    saveBtn: $("saveBtn"),
    addDialog: $("addDialog"),
    addUserName: $("addUserName"),
    addRegionSelect: $("addRegionSelect"),
    addUserField: $("addUserField"),
    addRegionField: $("addRegionField"),
    addDialogOk: $("addDialogOk"),
    addDialogCancel: $("addDialogCancel"),
    statusLegend: $("statusLegend"),
    renameDialog: $("renameDialog"),
    renameName: $("renameName"),
    renameFieldLabel: $("renameFieldLabel"),
    renameRemoveBtn: $("renameRemoveBtn"),
    renameDialogOk: $("renameDialogOk"),
    renameDialogCancel: $("renameDialogCancel"),
    confirmDialog: $("confirmDialog"),
    confirmDialogMessage: $("confirmDialogMessage"),
    confirmDialogYes: $("confirmDialogYes"),
    confirmDialogCancel: $("confirmDialogCancel")
  };

  let addInsertAt = 0;
  let renameRow = null;
  let confirmResolver = null;

  const model = {
    document: null,
    zoom: 1,
    selectedRow: null,
    selectionRow: null,
    anchor: null,
    selStart: null,
    selEnd: null,
    hoverRow: null,
    hoverDay: null,
    hoverKind: null,
    dragFrom: null,
    dragInsert: null,
    layout() {
      return VP.GridLayout.create(this.document.year, this.zoom, this.document.activeCount());
    },
    hasDaySelection() {
      const row = this.selectionRow;
      return (
        row != null &&
        row >= 0 &&
        row < this.document.rows.length &&
        this.document.isRowActive(row) &&
        !this.document.rows[row].isRegion &&
        this.selStart &&
        this.selEnd
      );
    },
    range() {
      return this.selStart <= this.selEnd
        ? { start: this.selStart, end: this.selEnd }
        : { start: this.selEnd, end: this.selStart };
    },
    contains(row, date) {
      if (!this.hasDaySelection() || this.selectionRow !== row) return false;
      const r = this.range();
      return date >= r.start && date <= r.end;
    },
    clearDays() {
      this.selectionRow = null;
      this.anchor = null;
      this.selStart = null;
      this.selEnd = null;
    },
    selectDay(row, date) {
      this.selectedRow = row;
      this.selectionRow = row;
      this.anchor = date;
      this.selStart = date;
      this.selEnd = date;
    }
  };

  let selectingDays = false;
  let draggingRow = false;
  let suppressScroll = false;
  let contextRow = null;
  let contextDay = null;
  let menuMode = null;

  async function init() {
    const loaded = await VP.Storage.load();
    model.document = loaded.document;
    model.document.onChanged = () => refresh(true);
    VP.YearCalendar.clearCache();
    renderLegend();
    bindToolbar();
    bindScroll();
    bindDayBody();
    bindRowHeader();
    bindMenu();
    bindAddDialog();
    bindRenameDialog();
    bindConfirmDialog();
    bindKeys();
    updateFileStatus();
    refresh(false);
    if (loaded.warning) window.alert(loaded.warning);
  }

  function updateFileStatus() {
    if (!els.fileStatus) return;
    if (VP.Storage.hasPlanFile()) {
      els.fileStatus.textContent = VP.Storage.planFileLabel() || VP.Storage.fileName();
      els.fileStatus.classList.add("is-connected");
      els.saveBtn.disabled = false;
    } else {
      els.fileStatus.textContent = "No plan file";
      els.fileStatus.classList.remove("is-connected");
      els.saveBtn.disabled = true;
    }
  }

  async function openPlanFile() {
    try {
      const doc = await VP.Storage.openPlanFile();
      model.document = doc;
      model.document.onChanged = () => refresh(true);
      model.clearDays();
      model.selectedRow = null;
      VP.YearCalendar.clearCache();
      updateFileStatus();
      refresh(true);
    } catch (err) {
      if (err && err.name === "AbortError") return;
      window.alert("Could not open plan file.\n\n" + (err && err.message ? err.message : err));
    }
  }

  function renderLegend() {
    const items = VP.Palette.legendItems || [];
    els.statusLegend.innerHTML = items
      .map((item) => {
        const letter = item.letter
          ? '<span class="legend-swatch" style="background:' +
            item.fill +
            ";color:" +
            item.ink +
            '">' +
            item.letter +
            "</span>"
          : '<span class="legend-swatch" style="background:#fff"></span>';
        return '<span class="legend-item">' + letter + "<span>" + item.label + "</span></span>";
      })
      .join("");
  }

  function activeIndexes() {
    return model.document.activeIndexes();
  }

  function realFromView(viewIndex) {
    const idxs = activeIndexes();
    if (viewIndex < 0 || viewIndex >= idxs.length) return -1;
    return idxs[viewIndex];
  }

  function insertRealFromView(viewInsert) {
    const idxs = activeIndexes();
    if (viewInsert >= idxs.length) return model.document.rows.length;
    return idxs[viewInsert];
  }

  function pruneInactiveSelection() {
    if (model.selectedRow != null && !model.document.isRowActive(model.selectedRow)) {
      model.selectedRow = null;
    }
    if (model.selectionRow != null && !model.document.isRowActive(model.selectionRow)) {
      model.clearDays();
    }
  }

  function refresh(save) {
    pruneInactiveSelection();
    const layout = model.layout();
    sizeCanvas(els.corner, layout.frozenWidth, layout.headerHeight);
    sizeCanvas(els.dayHeader, layout.bodyWidth, layout.headerHeight);
    sizeCanvas(els.rowHeader, layout.frozenWidth, layout.bodyHeight);
    sizeCanvas(els.dayBody, layout.bodyWidth, layout.bodyHeight);

    const ctxCorner = els.corner.getContext("2d");
    const ctxHeader = els.dayHeader.getContext("2d");
    const ctxRows = els.rowHeader.getContext("2d");
    const ctxBody = els.dayBody.getContext("2d");
    VP.Render.corner(ctxCorner, layout);
    VP.Render.dayHeader(ctxHeader, model, layout);
    VP.Render.rowHeader(ctxRows, model, layout);
    VP.Render.dayBody(ctxBody, model, layout);

    els.yearLabel.textContent = String(model.document.year);
    els.zoomLabel.textContent = Math.round(model.zoom * 100) + "%";
    els.undoBtn.disabled = !model.document.canUndo;
    els.redoBtn.disabled = !model.document.canRedo;
    $("yearPrev").disabled = model.document.year <= VP.PlanYears.FROM;
    $("yearNext").disabled = model.document.year >= VP.PlanYears.TO;

    if (save) VP.Storage.save(model.document);
  }

  function invalidate() {
    refresh(false);
  }

  function sizeCanvas(canvas, cssW, cssH) {
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function bindToolbar() {
    $("yearPrev").onclick = () => {
      if (model.document.year <= VP.PlanYears.FROM) return;
      model.clearDays();
      model.document.setYear(model.document.year - 1);
    };
    $("yearNext").onclick = () => {
      if (model.document.year >= VP.PlanYears.TO) return;
      model.clearDays();
      model.document.setYear(model.document.year + 1);
    };
    $("zoomOut").onclick = () => setZoom(model.zoom - 0.1);
    $("zoomIn").onclick = () => setZoom(model.zoom + 0.1);
    els.undoBtn.onclick = () => {
      if (model.document.undo()) model.clearDays();
    };
    els.redoBtn.onclick = () => {
      if (model.document.redo()) model.clearDays();
    };
    els.openPlanBtn.onclick = () => openPlanFile();
    els.saveBtn.onclick = async () => {
      if (!VP.Storage.hasPlanFile()) {
        window.alert("Open the shared plan file on the team drive first.");
        return;
      }
      els.saveBtn.disabled = true;
      try {
        await VP.Storage.saveShared(model.document);
        window.alert("Saved to " + (VP.Storage.planFileLabel() || VP.Storage.fileName()));
      } catch (err) {
        window.alert(
          "Could not save the plan file.\n\n" +
            (err && err.message ? err.message : err) +
            "\n\nUse Chrome/Edge, keep the team drive available, and reopen the file if needed."
        );
      } finally {
        updateFileStatus();
      }
    };
  }

  function setZoom(zoom) {
    zoom = Math.min(2, Math.max(0.6, Math.round(zoom * 10) / 10));
    if (Math.abs(zoom - model.zoom) < 0.001) return;
    model.zoom = zoom;
    invalidate();
  }

  function bindScroll() {
    els.bodyScroll.addEventListener("scroll", () => {
      if (suppressScroll) return;
      suppressScroll = true;
      els.headerScroll.scrollLeft = els.bodyScroll.scrollLeft;
      els.rowScroll.scrollTop = els.bodyScroll.scrollTop;
      suppressScroll = false;
    });

    document.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setZoom(model.zoom + (e.deltaY < 0 ? 0.1 : -0.1));
      },
      { passive: false }
    );
  }

  function canvasPoint(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  function bindDayBody() {
    const canvas = els.dayBody;

    canvas.addEventListener("mousemove", (e) => {
      const p = canvasPoint(canvas, e);
      const layout = model.layout();
      const hit = layout.tryHitDay(p.x, p.y);
      if (!hit) {
        clearDayHover();
        return;
      }
      const realRow = hit.addRow ? -1 : realFromView(hit.row);
      model.hoverRow = realRow;
      model.hoverDay = hit.day;
      model.hoverKind = null;

      if (
        selectingDays &&
        e.buttons === 1 &&
        !hit.addRow &&
        realRow >= 0 &&
        model.selectionRow === realRow &&
        !model.document.rows[realRow].isRegion
      ) {
        model.selEnd = layout.dateAt(hit.day);
      }

      updateTooltip(hit, layout, e, realRow);
      invalidate();
    });

    canvas.addEventListener("mouseleave", () => {
      if (!selectingDays) clearDayHover();
      hideTooltip();
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      const p = canvasPoint(canvas, e);
      const layout = model.layout();
      const hit = layout.tryHitDay(p.x, p.y);
      if (!hit) return;

      if (hit.addRow) {
        promptAddRow(insertRealFromView(hit.row));
        return;
      }
      const realRow = realFromView(hit.row);
      if (realRow < 0) return;
      const member = model.document.rows[realRow];
      if (member.isRegion) {
        model.selectedRow = realRow;
        model.clearDays();
        invalidate();
        return;
      }

      const date = layout.dateAt(hit.day);
      if (e.shiftKey && model.anchor && model.selectionRow === realRow) {
        model.selStart = model.anchor;
        model.selEnd = date;
        model.selectedRow = realRow;
      } else {
        model.selectDay(realRow, date);
        selectingDays = true;
      }
      invalidate();
      e.preventDefault();
    });

    window.addEventListener("mouseup", () => {
      if (selectingDays) {
        selectingDays = false;
        invalidate();
      }
      if (draggingRow) endRowDrag(true);
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const p = canvasPoint(canvas, e);
      const layout = model.layout();
      const hit = layout.tryHitDay(p.x, p.y);
      if (!hit || hit.addRow) return;
      const realRow = realFromView(hit.row);
      if (realRow < 0 || model.document.rows[realRow].isRegion) return;
      const date = layout.dateAt(hit.day);
      if (!(model.hasDaySelection() && model.selectionRow === realRow && model.contains(realRow, date))) {
        model.selectDay(realRow, date);
      }
      contextRow = realRow;
      contextDay = date;
      invalidate();
      openStatusMenu(e.clientX, e.clientY);
    });
  }

  function bindRowHeader() {
    const canvas = els.rowHeader;

    canvas.addEventListener("mousemove", (e) => {
      const p = canvasPoint(canvas, e);
      const layout = model.layout();
      const hit = layout.tryHitRow(p.x, p.y);
      if (!hit) {
        clearRowHover();
        return;
      }
      const realRow = hit.addRow ? -1 : realFromView(hit.row);
      model.hoverRow = realRow;
      model.hoverDay = null;
      model.hoverKind = hit.addRow ? null : hit.kind;

      if (draggingRow && model.dragFrom != null) {
        let viewInsert = hit.row + (p.y - hit.row * layout.rowHeight > layout.rowHeight / 2 ? 1 : 0);
        if (hit.addRow) viewInsert = activeIndexes().length;
        model.dragInsert = Math.max(0, Math.min(activeIndexes().length, viewInsert));
      }
      invalidate();
    });

    canvas.addEventListener("mouseleave", () => {
      if (!draggingRow) clearRowHover();
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      const p = canvasPoint(canvas, e);
      const layout = model.layout();
      const hit = layout.tryHitRow(p.x, p.y);
      if (!hit) return;

      if (hit.addRow) {
        promptAddRow(insertRealFromView(hit.row));
        return;
      }
      const realRow = realFromView(hit.row);
      if (realRow < 0) return;
      model.selectedRow = realRow;

      if (hit.kind === "handle") {
        draggingRow = true;
        model.dragFrom = realRow;
        model.dragInsert = hit.row;
        invalidate();
        e.preventDefault();
        return;
      }

      if (hit.kind === "start" && !model.document.rows[realRow].isRegion) {
        promptStartDays(realRow);
        return;
      }

      if (hit.kind === "name" && e.detail === 2) {
        promptRename(realRow);
      }
      invalidate();
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const p = canvasPoint(canvas, e);
      const layout = model.layout();
      const hit = layout.tryHitRow(p.x, p.y);
      if (!hit || hit.addRow) return;
      const realRow = realFromView(hit.row);
      if (realRow < 0) return;
      model.selectedRow = realRow;
      invalidate();
      openRowMenu(e.clientX, e.clientY, realRow);
    });
  }

  function endRowDrag(commit) {
    if (!draggingRow) return;
    const from = model.dragFrom;
    const viewInsert = model.dragInsert;
    draggingRow = false;
    model.dragFrom = null;
    model.dragInsert = null;
    if (commit && from != null && viewInsert != null) {
      model.document.move(from, insertRealFromView(viewInsert));
    } else invalidate();
  }

  function clearDayHover() {
    if (model.hoverDay == null && model.hoverRow == null) return;
    model.hoverDay = null;
    model.hoverRow = null;
    model.hoverKind = null;
    hideTooltip();
    invalidate();
  }

  function clearRowHover() {
    if (model.hoverRow == null && model.hoverKind == null) return;
    model.hoverRow = null;
    model.hoverKind = null;
    invalidate();
  }

  function updateTooltip(hit, layout, evt, realRow) {
    if (hit.addRow || realRow == null || realRow < 0) {
      hideTooltip();
      return;
    }
    const member = model.document.rows[realRow];
    const date = layout.dateAt(hit.day);
    const region = VP.LeaveMath.effectiveRegion(model.document.rows, realRow);
    const detail = VP.LeaveMath.describe(member, date, region);
    const tip = els.tooltip;
    tip.textContent = VP.LeaveMath.formatTooltip(detail, member.isRegion);
    tip.hidden = false;
    tip.style.left = evt.clientX + 14 + "px";
    tip.style.top = evt.clientY + 14 + "px";
  }

  function hideTooltip() {
    els.tooltip.hidden = true;
  }

  function bindMenu() {
    els.contextMenu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const mode = menuMode;
      const row = contextRow;
      closeMenu();
      if (mode === "status") applyStatus(action);
      else if (mode === "row") handleRowAction(action, row);
    });
    document.addEventListener("mousedown", (e) => {
      if (!els.contextMenu.hidden && !els.contextMenu.contains(e.target)) closeMenu();
    });
  }

  function openStatusMenu(x, y) {
    menuMode = "status";
    const P = VP.Palette;
    els.contextMenu.innerHTML =
      item("dayOff", "Annual Leave", P.dayOff) +
      item("flextimeComp", "Flextime Comp", P.flextimeComp) +
      item("shortTimeWork", "Short-Time-Work", P.shortTimeWork) +
      item("otherAbsence", "Other absence", P.otherAbsence) +
      item("parentalLeave", "parental leave", P.parental) +
      item("working", "working day", P.white);
    showMenu(x, y);
  }

  function openRowMenu(x, y, row) {
    menuMode = "row";
    contextRow = row;
    const region = model.document.rows[row].isRegion;
    els.contextMenu.innerHTML =
      item("rename", "Rename…") +
      (region ? "" : item("start", "Edit start days…")) +
      '<div class="menu-sep"></div>' +
      item("delete", "Delete row");
    showMenu(x, y);
  }

  function item(action, label, color) {
    const swatch = color
      ? '<span class="swatch" style="background:' + color + '"></span>'
      : "";
    return '<button type="button" data-action="' + action + '">' + swatch + label + "</button>";
  }

  function showMenu(x, y) {
    hideTooltip();
    const menu = els.contextMenu;
    menu.hidden = false;
    menu.style.left = "0px";
    menu.style.top = "0px";
    const rect = menu.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 8);
    const top = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = Math.max(8, left) + "px";
    menu.style.top = Math.max(8, top) + "px";
  }

  function closeMenu() {
    els.contextMenu.hidden = true;
    menuMode = null;
  }

  function applyStatus(status) {
    if (model.hasDaySelection()) {
      const r = model.range();
      model.document.setStatus(model.selectionRow, r.start, r.end, status);
      return;
    }
    if (contextRow != null && contextDay) model.document.setStatus(contextRow, contextDay, contextDay, status);
  }

  function handleRowAction(action, row) {
    if (row == null) return;
    if (action === "rename") promptRename(row);
    else if (action === "start") promptStartDays(row);
    else if (action === "delete") {
      const member = model.document.rows[row];
      if (member.isRegion) confirmRemoveRegion(row);
      else confirmRemoveUser(row);
    }
  }

  function promptRename(row) {
    renameRow = row;
    const member = model.document.rows[row];
    const isUser = !member.isRegion;
    els.renameFieldLabel.textContent = isUser ? "user-name" : "name";
    els.renameName.value = VP.nameFor(member, model.document.year);
    if (isUser) {
      els.renameRemoveBtn.textContent = "remove user";
      els.renameRemoveBtn.hidden = false;
      els.renameRemoveBtn.disabled = false;
    } else if (model.document.canRemoveRegion(row)) {
      els.renameRemoveBtn.textContent = "remove region";
      els.renameRemoveBtn.hidden = false;
      els.renameRemoveBtn.disabled = false;
    } else {
      els.renameRemoveBtn.textContent = "remove region";
      els.renameRemoveBtn.hidden = false;
      els.renameRemoveBtn.disabled = true;
      els.renameRemoveBtn.title = "At least one region must remain";
    }
    if (isUser) els.renameRemoveBtn.title = "";
    els.renameDialog.hidden = false;
    closeMenu();
    queueMicrotask(() => {
      els.renameName.focus();
      els.renameName.select();
    });
  }

  function closeRenameDialog() {
    els.renameDialog.hidden = true;
    renameRow = null;
  }

  function confirmRenameDialog() {
    if (renameRow == null) return;
    const name = els.renameName.value.trim();
    if (!name) {
      els.renameName.focus();
      return;
    }
    const row = renameRow;
    closeRenameDialog();
    model.document.rename(row, name);
  }

  function confirmRemoveUser(row) {
    const name = VP.nameFor(model.document.rows[row], model.document.year);
    return openConfirmDialog("Are you sure to remove User " + name + " from the list?").then((ok) => {
      if (!ok) return false;
      model.clearDays();
      if (model.selectedRow === row) model.selectedRow = null;
      model.document.removeUserFromYear(row, model.document.year);
      return true;
    });
  }

  function confirmRemoveRegion(row) {
    if (!model.document.canRemoveRegion(row)) {
      window.alert("At least one region must remain.");
      return Promise.resolve(false);
    }
    const name = VP.nameFor(model.document.rows[row], model.document.year);
    return openConfirmDialog("Are you sure to remove region '" + name + "' from the list?").then((ok) => {
      if (!ok) return false;
      model.clearDays();
      if (model.selectedRow === row) model.selectedRow = null;
      model.document.removeRegionAt(row);
      return true;
    });
  }

  function openConfirmDialog(message) {
    if (confirmResolver) {
      confirmResolver(false);
      confirmResolver = null;
    }
    els.confirmDialogMessage.textContent = message;
    els.confirmDialog.hidden = false;
    return new Promise((resolve) => {
      confirmResolver = resolve;
      queueMicrotask(() => els.confirmDialogYes.focus());
    });
  }

  function closeConfirmDialog(result) {
    els.confirmDialog.hidden = true;
    const resolve = confirmResolver;
    confirmResolver = null;
    if (resolve) resolve(!!result);
  }

  function bindRenameDialog() {
    els.renameDialogOk.addEventListener("click", confirmRenameDialog);
    els.renameDialogCancel.addEventListener("click", closeRenameDialog);
    els.renameRemoveBtn.addEventListener("click", () => {
      if (renameRow == null || els.renameRemoveBtn.disabled) return;
      const row = renameRow;
      const isRegion = model.document.rows[row].isRegion;
      closeRenameDialog();
      if (isRegion) confirmRemoveRegion(row);
      else confirmRemoveUser(row);
    });
    els.renameDialog.addEventListener("mousedown", (e) => {
      if (e.target === els.renameDialog) closeRenameDialog();
    });
    els.renameName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmRenameDialog();
      }
    });
  }

  function bindConfirmDialog() {
    els.confirmDialogYes.addEventListener("click", () => closeConfirmDialog(true));
    els.confirmDialogCancel.addEventListener("click", () => closeConfirmDialog(false));
    els.confirmDialog.addEventListener("mousedown", (e) => {
      if (e.target === els.confirmDialog) closeConfirmDialog(false);
    });
  }

  function promptStartDays(row) {
    const current = String(model.document.startDaysFor(row));
    const text = window.prompt("Available day-off days:", current);
    if (text == null) return;
    const days = parseInt(text, 10);
    if (!Number.isNaN(days)) model.document.setStart(row, days);
  }

  function promptAddRow(insertAt) {
    addInsertAt = insertAt;
    populateRegionSelect();
    const userRadio = els.addDialog.querySelector('input[name="addKind"][value="user"]');
    if (userRadio) userRadio.checked = true;
    els.addUserName.value = "New user";
    syncAddDialogFields();
    els.addDialog.hidden = false;
    closeMenu();
    queueMicrotask(() => {
      els.addUserName.focus();
      els.addUserName.select();
    });
  }

  function populateRegionSelect() {
    const select = els.addRegionSelect;
    const previous = select.value;
    select.innerHTML = "";
    for (const region of VP.Regions.all) {
      const option = document.createElement("option");
      option.value = region.code;
      option.textContent = region.label;
      select.appendChild(option);
    }
    if (previous && VP.Regions.find(previous)) select.value = previous;
    else select.value = "BY";
  }

  function addKind() {
    const checked = els.addDialog.querySelector('input[name="addKind"]:checked');
    return checked ? checked.value : "user";
  }

  function syncAddDialogFields() {
    const kind = addKind();
    const isUser = kind === "user";
    els.addUserName.disabled = !isUser;
    els.addRegionSelect.disabled = isUser;
    els.addUserField.classList.toggle("is-disabled", !isUser);
    els.addRegionField.classList.toggle("is-disabled", isUser);
  }

  function closeAddDialog() {
    els.addDialog.hidden = true;
  }

  function confirmAddDialog() {
    const kind = addKind();
    if (kind === "user") {
      const name = els.addUserName.value.trim();
      if (!name) {
        els.addUserName.focus();
        return;
      }
      model.document.insert(addInsertAt, VP.MemberRow.user(name));
      closeAddDialog();
      return;
    }

    const code = els.addRegionSelect.value;
    if (!code) return;
    try {
      model.document.insert(addInsertAt, VP.MemberRow.region(code));
      closeAddDialog();
    } catch (err) {
      window.alert(err.message || String(err));
    }
  }

  function bindAddDialog() {
    for (const radio of els.addDialog.querySelectorAll('input[name="addKind"]')) {
      radio.addEventListener("change", () => {
        syncAddDialogFields();
        if (addKind() === "user") {
          els.addUserName.focus();
          els.addUserName.select();
        } else {
          els.addRegionSelect.focus();
        }
      });
    }
    els.addDialogOk.addEventListener("click", confirmAddDialog);
    els.addDialogCancel.addEventListener("click", closeAddDialog);
    els.addDialog.addEventListener("mousedown", (e) => {
      if (e.target === els.addDialog) closeAddDialog();
    });
    els.addUserName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAddDialog();
      }
    });
  }

  function bindKeys() {
    document.addEventListener("keydown", (e) => {
      if (!els.confirmDialog.hidden) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeConfirmDialog(false);
        } else if (e.key === "Enter") {
          e.preventDefault();
          closeConfirmDialog(true);
        }
        return;
      }
      if (!els.renameDialog.hidden) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeRenameDialog();
        }
        return;
      }
      if (!els.addDialog.hidden) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeAddDialog();
        }
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (model.document.undo()) model.clearDays();
      } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (model.document.redo()) model.clearDays();
      } else if (e.key === "Delete" && model.hasDaySelection()) {
        e.preventDefault();
        applyStatus("working");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
