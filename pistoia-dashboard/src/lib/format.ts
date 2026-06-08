// Italian-locale formatting helpers.

const eur0 = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const num0 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

/** "142.000.000 €" */
export function formatEuro(value: number) {
  return eur0.format(value);
}

/** Compact, human currency: 142.000.000 € -> "142 mln €", 1.200.000 -> "1,2 mln €". */
export function formatEuroCompact(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    const mln = abs / 1_000_000;
    const str = mln >= 10 ? num0.format(Math.round(mln)) : mln.toFixed(1).replace(".", ",");
    return `${sign}${str} mln €`;
  }
  if (abs >= 1_000) {
    return `${sign}${num0.format(Math.round(abs / 1_000))} mila €`;
  }
  return `${sign}${num0.format(abs)} €`;
}

/** "1.234" */
export function formatNumber(value: number) {
  return num0.format(value);
}

/** "+4", "−2", "0" with a unicode minus for nicer typography. */
export function formatDelta(value: number) {
  if (value > 0) return `+${num0.format(value)}`;
  if (value < 0) return `−${num0.format(Math.abs(value))}`;
  return "0";
}

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});

const dateShortFmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Rome",
});

export function formatDate(date: Date | string) {
  return dateFmt.format(new Date(date));
}

export function formatDateShort(date: Date | string) {
  return dateShortFmt.format(new Date(date));
}

/** Relative time in Italian: "2 ore fa", "3 giorni fa". */
export function formatRelativeTime(date: Date | string, now: Date = new Date()) {
  const then = new Date(date).getTime();
  const diff = Math.round((then - now.getTime()) / 1000); // seconds, negative for past
  const rtf = new Intl.RelativeTimeFormat("it-IT", { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 2_592_000) return rtf.format(Math.round(diff / 86400), "day");
  if (abs < 31_536_000) return rtf.format(Math.round(diff / 2_592_000), "month");
  return rtf.format(Math.round(diff / 31_536_000), "year");
}

const MONTHS_SHORT = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

export function monthLabel(month1to12: number) {
  return MONTHS_SHORT[(month1to12 - 1 + 12) % 12];
}
