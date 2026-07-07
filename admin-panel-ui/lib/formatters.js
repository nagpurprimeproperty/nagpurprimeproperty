const LOCALE = "en-IN";
const INR = { style: "currency", currency: "INR" };

/** Whole rupees, e.g. ₹12,34,567 */
export function formatInr(value) {
    if (value == null || value === "")
        return "—";
    const n = Number(value);
    if (!Number.isFinite(n))
        return "—";
    return new Intl.NumberFormat(LOCALE, { ...INR, maximumFractionDigits: 0 }).format(n);
}

/** Compact currency for dense UI (cards, tables), e.g. ₹12.3L */
export function formatInrCompact(value) {
    if (value == null || value === "")
        return "—";
    const n = Number(value);
    if (!Number.isFinite(n))
        return "—";
    return new Intl.NumberFormat(LOCALE, {
        ...INR,
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(n);
}
