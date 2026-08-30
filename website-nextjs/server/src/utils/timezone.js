const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30 in milliseconds
export const TIMEZONE_NAME = 'Asia/Kolkata';
export const TIMEZONE_OFFSET_STR = '+05:30';

/**
 * Converts a Date or ISO string into an ISO string with +05:30 IST offset
 * e.g., '2026-08-30T13:06:06.123+05:30'
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function toISTISOString(dateInput) {
  if (!dateInput) return dateInput;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  return istDate.toISOString().replace('Z', TIMEZONE_OFFSET_STR);
}

/**
 * Formats a lead date relative to IST today / yesterday / X days ago with 12-hour IST time
 * e.g. "TODAY 01:06 PM" or "YESTERDAY" or "5 DAYS AGO"
 * @param {Date|string|number} dateStr
 * @returns {string}
 */
export function formatLeadDateIST(dateStr) {
  if (!dateStr) return '';
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE_NAME,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const time = timeFormatter.format(date).toUpperCase();

  const dateIST = new Date(date.getTime() + IST_OFFSET_MS);
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);

  const dateMidnight = Date.UTC(dateIST.getUTCFullYear(), dateIST.getUTCMonth(), dateIST.getUTCDate());
  const nowMidnight = Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate());

  const diffDays = Math.round((nowMidnight - dateMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `TODAY ${time}`;
  if (diffDays === 1) return `YESTERDAY`;
  if (diffDays > 1) return `${diffDays} DAYS AGO`;
  return `TODAY ${time}`;
}

/**
 * Formats an enquiry date into "DD MMM YYYY , TODAY/WEEKDAY , hh:mm AM/PM" strictly in IST
 * e.g. "30 AUG 2026 , TODAY , 01:06 PM"
 * @param {Date|string|number} value
 * @returns {string}
 */
export function formatEnquiredDateIST(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Format parts in IST
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE_NAME,
    year: 'numeric',
    month: 'numeric',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);

  const partMap = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const day = (partMap.day || '01').padStart(2, '0');
  const monthIndex = parseInt(partMap.month, 10) - 1;
  const month = months[monthIndex] || 'JAN';
  const year = partMap.year || '';
  const hour = partMap.hour || '12';
  const minute = (partMap.minute || '00').padStart(2, '0');
  const period = (partMap.dayPeriod || 'AM').toUpperCase();

  const formattedDate = `${day} ${month} ${year}`;
  const formattedTime = `${hour}:${minute} ${period}`;

  const dateIST = new Date(date.getTime() + IST_OFFSET_MS);
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);

  const dateMidnight = Date.UTC(dateIST.getUTCFullYear(), dateIST.getUTCMonth(), dateIST.getUTCDate());
  const nowMidnight = Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate());

  const diffDays = Math.round((nowMidnight - dateMidnight) / (1000 * 60 * 60 * 24));

  let relativeLabel;
  if (diffDays === 0) {
    relativeLabel = 'TODAY';
  } else {
    const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE_NAME,
      weekday: 'long',
    });
    relativeLabel = weekdayFormatter.format(date).toUpperCase();
  }

  return `${formattedDate} , ${relativeLabel} , ${formattedTime}`;
}

/**
 * Initializes process-level Indian Timezone and overrides Date.prototype.toJSON
 * so all JSON responses automatically serialize Date instances to IST.
 */
export function initTimezone() {
  process.env.TZ = TIMEZONE_NAME;

  Date.prototype.toJSON = function () {
    if (isNaN(this.getTime())) return null;
    const istDate = new Date(this.getTime() + IST_OFFSET_MS);
    return istDate.toISOString().replace('Z', TIMEZONE_OFFSET_STR);
  };
}
