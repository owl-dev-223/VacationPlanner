window.VP = window.VP || {};

(function (VP) {
  const YEAR_FROM = 2026;
  const YEAR_TO = 2036;

  function uid() {
    return crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function createUser(name, startDays) {
    const days = startDays == null ? 30 : startDays;
    return {
      id: uid(),
      isRegion: false,
      name: name || "New user",
      nameByYear: {},
      regionCode: null,
      startDays: days,
      startByYear: {},
      removedFromYear: null,
      marks: {}
    };
  }

  function createRegion(code) {
    const known = VP.Regions.find(code);
    if (!known) throw new Error("Unknown region '" + code + "'");
    return {
      id: uid(),
      isRegion: true,
      name: known.label,
      nameByYear: {},
      regionCode: known.code,
      startDays: 0,
      startByYear: {},
      removedFromYear: null,
      marks: {}
    };
  }

  function normalizeMarks(marks, yearFrom, yearTo) {
    if (!marks || typeof marks !== "object") return {};
    const out = {};
    for (const key of Object.keys(marks)) {
      if (marks[key] === "sickLeave") continue;
      if (!VP.Dates.tryParse(key)) continue;
      const y = VP.Dates.parse(key).y;
      if (y < yearFrom || y > yearTo) continue;
      out[key] = marks[key];
    }
    return out;
  }

  function normalizeRemovedFromYear(value) {
    if (value == null || value === "") return null;
    const year = value | 0;
    if (year < YEAR_FROM || year > YEAR_TO + 1) return null;
    return year;
  }

  function normalizeStartByYear(raw) {
    const out = {};
    if (raw && typeof raw === "object") {
      for (const key of Object.keys(raw)) {
        const year = key | 0;
        if (year < YEAR_FROM || year > YEAR_TO) continue;
        out[String(year)] = Math.max(0, Math.min(366, raw[key] | 0));
      }
    }
    return out;
  }

  function normalizeNameByYear(raw) {
    const out = {};
    if (raw && typeof raw === "object") {
      for (const key of Object.keys(raw)) {
        const year = key | 0;
        if (year < YEAR_FROM || year > YEAR_TO) continue;
        const value = String(raw[key] || "").trim();
        if (value) out[String(year)] = value;
      }
    }
    return out;
  }

  function normalizeRow(row) {
    const startDays = row.startDays | 0;
    return {
      id: row.id && String(row.id).trim() ? row.id : uid(),
      isRegion: !!row.isRegion,
      name: row.name || "",
      nameByYear: row.isRegion ? {} : normalizeNameByYear(row.nameByYear),
      regionCode: row.regionCode || null,
      startDays: startDays,
      startByYear: row.isRegion ? {} : normalizeStartByYear(row.startByYear),
      removedFromYear: row.isRegion ? null : normalizeRemovedFromYear(row.removedFromYear),
      marks: normalizeMarks(row.marks, YEAR_FROM, YEAR_TO)
    };
  }

  function startDaysFor(row, year) {
    if (!row || row.isRegion) return 0;
    const key = String(year);
    if (row.startByYear && row.startByYear[key] != null) return row.startByYear[key] | 0;
    return row.startDays | 0;
  }

  function nameFor(row, year) {
    if (!row) return "";
    if (row.isRegion) return row.name || "";
    const key = String(year);
    if (row.nameByYear && row.nameByYear[key]) return row.nameByYear[key];
    return row.name || "";
  }

  function isRowActiveInYear(row, year) {
    if (!row) return false;
    if (row.isRegion) return true;
    return row.removedFromYear == null || year < row.removedFromYear;
  }

  function createSample() {
    const doc = new PlanDocument({ version: 1, year: 2026, rows: [] });
    const users = [];
    doc.rows.push(createRegion("BY"));
    for (let i = 1; i <= 6; i++) users.push(addUser(doc, i));
    doc.rows.push(createRegion("IN"));
    for (let i = 7; i <= 10; i++) users.push(addUser(doc, i));
    doc.rows.push(createRegion("NI"));
    for (let i = 11; i <= 12; i++) users.push(addUser(doc, i));

    markRange(users[0], "2026-01-12", "2026-01-16", "dayOff");
    markRange(users[0], "2026-11-16", "2026-11-20", "dayOff");
    users[2].marks["2026-01-20"] = "flextimeComp";
    users[2].marks["2026-11-11"] = "otherAbsence";
    users[4].marks["2026-01-14"] = "dayOff";
    markRange(users[5], "2026-11-23", "2026-11-27", "parentalLeave");
    return doc;

    function addUser(document, number) {
      const row = createUser("User " + number);
      document.rows.push(row);
      return row;
    }

    function markRange(row, start, end, status) {
      VP.Dates.eachDay(start, end, (date) => {
        row.marks[date] = status;
      });
    }
  }

  class PlanDocument {
    constructor(data) {
      this.version = data?.version || 2;
      this.yearFrom = YEAR_FROM;
      this.yearTo = YEAR_TO;
      this.year = clampYear(data?.year || YEAR_FROM);
      this.rows = (data?.rows || []).map(normalizeRow);
      this._undo = [];
      this._redo = [];
      this.onChanged = null;
    }

    get canUndo() {
      return this._undo.length > 0;
    }

    get canRedo() {
      return this._redo.length > 0;
    }

    touch() {
      this._emit();
    }

    setYear(year) {
      year = clampYear(year);
      if (year === this.year) return;
      this.year = year;
      VP.YearCalendar.clearCache();
      this._emit();
    }

    isRowActive(rowIndex, year) {
      year = year == null ? this.year : year;
      if (rowIndex < 0 || rowIndex >= this.rows.length) return false;
      return isRowActiveInYear(this.rows[rowIndex], year);
    }

    activeIndexes(year) {
      year = year == null ? this.year : year;
      const out = [];
      for (let i = 0; i < this.rows.length; i++) {
        if (isRowActiveInYear(this.rows[i], year)) out.push(i);
      }
      return out;
    }

    activeCount(year) {
      return this.activeIndexes(year).length;
    }

    setStatus(rowIndex, start, end, status) {
      if (rowIndex < 0 || rowIndex >= this.rows.length || this.rows[rowIndex].isRegion) return;
      if (end < start) [start, end] = [end, start];
      this._capture();
      const marks = this.rows[rowIndex].marks;
      VP.Dates.eachDay(start, end, (date) => {
        if (status === "working") delete marks[date];
        else marks[date] = status;
      });
      this._emit();
    }

    startDaysFor(rowIndex, year) {
      if (rowIndex < 0 || rowIndex >= this.rows.length) return 0;
      return startDaysFor(this.rows[rowIndex], year == null ? this.year : year);
    }

    setStart(rowIndex, days) {
      if (rowIndex < 0 || rowIndex >= this.rows.length || this.rows[rowIndex].isRegion) return;
      days = Math.max(0, Math.min(366, days | 0));
      const row = this.rows[rowIndex];
      const key = String(this.year);
      if (startDaysFor(row, this.year) === days) return;
      this._capture();
      row.startByYear = row.startByYear || {};
      row.startByYear[key] = days;
      row.startDays = days;
      this._emit();
    }

    nameFor(rowIndex, year) {
      if (rowIndex < 0 || rowIndex >= this.rows.length) return "";
      return nameFor(this.rows[rowIndex], year == null ? this.year : year);
    }

    rename(rowIndex, name) {
      if (rowIndex < 0 || rowIndex >= this.rows.length) return;
      name = String(name || "").trim();
      if (!name) return;
      const row = this.rows[rowIndex];
      if (row.isRegion) {
        if (row.name === name) return;
        this._capture();
        row.name = name;
        this._emit();
        return;
      }

      const year = this.year;
      if (nameFor(row, year) === name) return;
      this._capture();
      const byYear = {};
      for (let y = YEAR_FROM; y <= YEAR_TO; y++) {
        byYear[String(y)] = y >= year ? name : nameFor(row, y);
      }
      row.nameByYear = byYear;
      row.name = byYear[String(YEAR_FROM)] || name;
      this._emit();
    }

    insert(index, row) {
      this._capture();
      index = Math.max(0, Math.min(this.rows.length, index));
      this.rows.splice(index, 0, normalizeRow(row));
      this._emit();
    }

    removeAt(index) {
      if (index < 0 || index >= this.rows.length) return;
      this._capture();
      this.rows.splice(index, 1);
      this._emit();
    }

    regionCount() {
      let count = 0;
      for (let i = 0; i < this.rows.length; i++) {
        if (this.rows[i].isRegion) count++;
      }
      return count;
    }

    canRemoveRegion(rowIndex) {
      if (rowIndex < 0 || rowIndex >= this.rows.length) return false;
      if (!this.rows[rowIndex].isRegion) return false;
      return this.regionCount() > 1;
    }

    /**
     * Remove a region row. Users that belonged to it are moved under the next
     * region below, or under the previous region if this was the last one.
     * Refuses when only one region remains.
     */
    removeRegionAt(rowIndex) {
      if (!this.canRemoveRegion(rowIndex)) return false;

      let userEnd = rowIndex + 1;
      while (userEnd < this.rows.length && !this.rows[userEnd].isRegion) userEnd++;
      const userCount = userEnd - (rowIndex + 1);

      let nextRegion = -1;
      for (let i = rowIndex + 1; i < this.rows.length; i++) {
        if (this.rows[i].isRegion) {
          nextRegion = i;
          break;
        }
      }
      let prevRegion = -1;
      for (let i = rowIndex - 1; i >= 0; i--) {
        if (this.rows[i].isRegion) {
          prevRegion = i;
          break;
        }
      }
      const targetWasNext = nextRegion >= 0;
      if (!targetWasNext && prevRegion < 0) return false;

      this._capture();
      const users = userCount > 0 ? this.rows.splice(rowIndex + 1, userCount) : [];
      this.rows.splice(rowIndex, 1);

      let targetIdx;
      if (targetWasNext) targetIdx = nextRegion - userCount - 1;
      else targetIdx = prevRegion;

      const insertAt = targetIdx + 1;
      for (let i = 0; i < users.length; i++) {
        this.rows.splice(insertAt + i, 0, users[i]);
      }
      this._emit();
      return true;
    }

    /** Hide user from current and future years; keep past-year marks and visibility. */
    removeUserFromYear(rowIndex, year) {
      if (rowIndex < 0 || rowIndex >= this.rows.length) return;
      const row = this.rows[rowIndex];
      if (row.isRegion) return;
      year = clampYear(year == null ? this.year : year);
      if (row.removedFromYear != null && row.removedFromYear <= year) return;
      this._capture();
      row.removedFromYear = year;
      for (const key of Object.keys(row.marks)) {
        if (!VP.Dates.tryParse(key)) continue;
        if (VP.Dates.parse(key).y >= year) delete row.marks[key];
      }
      this._emit();
    }

    move(from, insertAt) {
      if (from < 0 || from >= this.rows.length) return;
      insertAt = Math.max(0, Math.min(this.rows.length, insertAt));
      if (insertAt === from || insertAt === from + 1) return;
      this._capture();
      const row = this.rows.splice(from, 1)[0];
      if (insertAt > from) insertAt--;
      this.rows.splice(insertAt, 0, row);
      this._emit();
    }

    undo() {
      if (!this._undo.length) return false;
      this._redo.push(this._serializeRows());
      this._restore(this._undo.pop());
      return true;
    }

    redo() {
      if (!this._redo.length) return false;
      this._undo.push(this._serializeRows());
      this._restore(this._redo.pop());
      return true;
    }

    toJSON() {
      return {
        version: 2,
        yearFrom: YEAR_FROM,
        yearTo: YEAR_TO,
        year: this.year,
        rows: this.rows.map((r) => {
          const out = {
            id: r.id,
            isRegion: r.isRegion,
            name: nameFor(r, this.year),
            regionCode: r.regionCode,
            startDays: startDaysFor(r, this.year),
            marks: normalizeMarks(r.marks, YEAR_FROM, YEAR_TO)
          };
          if (!r.isRegion) {
            const startByYear = {};
            const nameByYear = {};
            for (let y = YEAR_FROM; y <= YEAR_TO; y++) {
              startByYear[String(y)] = startDaysFor(r, y);
              nameByYear[String(y)] = nameFor(r, y);
            }
            out.startByYear = startByYear;
            out.nameByYear = nameByYear;
            out.name = nameByYear[String(YEAR_FROM)] || r.name;
            if (r.removedFromYear != null) out.removedFromYear = r.removedFromYear;
          }
          return out;
        })
      };
    }

    static fromJSON(data) {
      if (typeof data === "string") data = JSON.parse(data);
      if (!data || typeof data !== "object") throw new Error("Invalid plan file");
      return new PlanDocument(data);
    }

    _capture() {
      this._undo.push(this._serializeRows());
      if (this._undo.length > 100) this._undo.shift();
      this._redo = [];
    }

    _serializeRows() {
      return JSON.stringify(this.rows);
    }

    _restore(json) {
      this.rows = JSON.parse(json).map(normalizeRow);
      this._emit();
    }

    _emit() {
      if (typeof this.onChanged === "function") this.onChanged();
    }
  }

  function clampYear(year) {
    year = year | 0;
    if (year < YEAR_FROM) return YEAR_FROM;
    if (year > YEAR_TO) return YEAR_TO;
    return year;
  }

  VP.PlanYears = { FROM: YEAR_FROM, TO: YEAR_TO };
  VP.MemberRow = { user: createUser, region: createRegion };
  VP.PlanDocument = PlanDocument;
  VP.createSample = createSample;
  VP.startDaysFor = startDaysFor;
  VP.nameFor = nameFor;
})(window.VP);
