/** Get timezone offset in minutes from UTC for a given IANA timezone. */
export function getTimezoneOffsetMinutes(timeZone: string, date: Date): number {
  try {
    const str = date.toLocaleString("en-US", { timeZone, timeZoneName: "longOffset" });
    const match = str.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
    if (!match) return 330; // fallback IST
    const sign = match[1].startsWith("+") ? 1 : -1;
    const hours = parseInt(match[1].replace(/[+-]/, ""), 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return sign * (hours * 60 + minutes);
  } catch {
    return 330;
  }
}

/** Parse local birth date/time in a timezone into a UTC Date. */
export function parseBirthDateTime(
  date: string,
  time: string,
  timezone: string
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = getTimezoneOffsetMinutes(timezone, probe);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - offset * 60 * 1000);
}
