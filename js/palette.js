window.VP = window.VP || {};

(function (VP) {
  const STATUS_META = {
    dayOff: { letter: "A", label: "Annual Leave", fill: "#2E7D32", ink: "#FFFFFF" },
    flextimeComp: { letter: "F", label: "Flextime Comp", fill: "#B2EBF2", ink: "#222222" },
    shortTimeWork: { letter: "S", label: "Short-Time-Work", fill: "#C5CFA3", ink: "#222222" },
    otherAbsence: { letter: "O", label: "Other absence", fill: "#B0BEC5", ink: "#FFFFFF" },
    parentalLeave: { letter: "P", label: "parental leave", fill: "#8FCB6B", ink: "#222222" },
    working: { letter: "", label: "working day", fill: "#FFFFFF", ink: "#222222" }
  };

  VP.Palette = {
    dayOff: STATUS_META.dayOff.fill,
    flextimeComp: STATUS_META.flextimeComp.fill,
    shortTimeWork: STATUS_META.shortTimeWork.fill,
    otherAbsence: STATUS_META.otherAbsence.fill,
    parental: STATUS_META.parentalLeave.fill,
    weekend: "#F2F2F2",
    bank: "#D0D0D0",
    school: "#C5DCF2",
    region: "#E7F1FA",
    selectedRow: "#D6E6F8",
    dragRow: "#FFF4D0",
    startHover: "#FFF8E1",
    selectFill: "rgba(47,111,219,0.19)",
    selectStroke: "#2F6FDB",
    headerHover: "#E8F0FB",
    grip: "#9A9A9A",
    muted: "#666666",
    ink: "#222222",
    openPositive: "#1E7A34",
    openNegative: "#C0392B",
    addText: "#888888",
    today: "#E67E22",
    grid: "#E0E0E0",
    month: "#B0B0B0",
    hover: "#8A8A8A",
    white: "#FFFFFF",
    legendItems: [
      STATUS_META.dayOff,
      STATUS_META.flextimeComp,
      STATUS_META.shortTimeWork,
      STATUS_META.otherAbsence,
      STATUS_META.parentalLeave,
      STATUS_META.working
    ],
    forStatus(status) {
      const meta = STATUS_META[status];
      return meta ? meta.fill : this.white;
    },
    letterFor(status) {
      const meta = STATUS_META[status];
      return meta && meta.letter ? meta.letter : "";
    },
    inkFor(status) {
      const meta = STATUS_META[status];
      return meta ? meta.ink : this.ink;
    }
  };
})(window.VP);
