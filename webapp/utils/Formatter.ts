import DateFormat from "sap/ui/core/format/DateFormat";

class Formatter {
  public toUTCDate(value: string, pattern = "yyyyMMdd") {
    if (!value) {
      return null;
    }

    const instance = DateFormat.getDateInstance({
      pattern,
    });

    return instance.parse(value, true);
  }

  public formatDate(
    value: Date | string,
    source: string = "yyyyMMdd",
    pattern: string = "dd.MM.yyyy",
  ): string {
    if (!value) {
      return "";
    }

    const sourceInstance = DateFormat.getDateInstance({
      pattern: source,
    });

    const targetInstance = DateFormat.getDateInstance({
      pattern,
    });

    const parsedValue =
      typeof value === "string" ? sourceInstance.parse(value) : value;

    return targetInstance.format(parsedValue);
  }

  public formatDateCustom(vDate: Date | string): string {
    if (!vDate) {
      return "";
    }

    // Already a Date object
    if (vDate instanceof Date) {
      const y = vDate.getFullYear();
      const m = String(vDate.getMonth() + 1).padStart(2, "0");
      const d = String(vDate.getDate()).padStart(2, "0");

      return `${y}-${m}-${d}`;
    }

    let sDate = String(vDate).trim();

    // SAP format: YYYYMMDD
    if (/^\d{8}$/.test(sDate)) {
      return `${sDate.substring(0, 4)}-${sDate.substring(4, 6)}-${sDate.substring(6, 8)}`;
    }

    // Common separators: -, /, ., space
    const aParts = sDate.split(/[-/. ]/);

    if (aParts.length === 3) {
      const y = aParts[0];
      const m = aParts[1].padStart(2, "0");
      const d = aParts[2].padStart(2, "0");

      if (y.length === 4) {
        return `${y}-${m}-${d}`;
      }
    }

    return "";
  }
}

export default new Formatter();
