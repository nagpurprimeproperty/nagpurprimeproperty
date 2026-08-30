import assert from 'node:assert/strict';
import {
  initTimezone,
  toISTISOString,
  formatLeadDateIST,
  formatEnquiredDateIST,
} from '../src/utils/timezone.js';

console.log('--- Testing Timezone Configuration and IST formatting ---');

// 1. Initialize Timezone
initTimezone();
assert.equal(process.env.TZ, 'Asia/Kolkata', 'process.env.TZ should be Asia/Kolkata');

// 2. Test toISTISOString
const testUtcDate = new Date('2026-08-30T07:30:00.000Z'); // 1:00 PM IST
const istIso = toISTISOString(testUtcDate);
console.log('toISTISOString output:', istIso);
assert.equal(istIso, '2026-08-30T13:00:00.000+05:30', 'Should format to IST with +05:30 offset');

// 3. Test Date.prototype.toJSON serialization
const obj = { createdAt: testUtcDate };
const jsonStr = JSON.stringify(obj);
console.log('JSON.stringify output:', jsonStr);
assert.equal(
  jsonStr,
  '{"createdAt":"2026-08-30T13:00:00.000+05:30"}',
  'JSON.stringify should serialize Date with +05:30 offset'
);

// 4. Test formatLeadDateIST
const leadToday = new Date();
const leadFormattedToday = formatLeadDateIST(leadToday);
console.log('formatLeadDateIST (today):', leadFormattedToday);
assert.match(leadFormattedToday, /^TODAY \d{2}:\d{2} (AM|PM)$/, 'Should format as TODAY hh:mm AM/PM in IST');

const leadYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const leadFormattedYesterday = formatLeadDateIST(leadYesterday);
console.log('formatLeadDateIST (yesterday):', leadFormattedYesterday);
assert.equal(leadFormattedYesterday, 'YESTERDAY', 'Should format as YESTERDAY');

const lead5DaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const leadFormatted5DaysAgo = formatLeadDateIST(lead5DaysAgo);
console.log('formatLeadDateIST (5 days ago):', leadFormatted5DaysAgo);
assert.equal(leadFormatted5DaysAgo, '5 DAYS AGO', 'Should format as 5 DAYS AGO');

// 5. Test formatEnquiredDateIST
const enquiryFormatted = formatEnquiredDateIST(testUtcDate);
console.log('formatEnquiredDateIST output:', enquiryFormatted);
// 6. Test midnight day boundary crossing
const utcLateNight = new Date('2026-08-29T20:00:00.000Z'); // 1:30 AM on 30 AUG in IST
const istMidnightIso = toISTISOString(utcLateNight);
console.log('Midnight crossing toISTISOString output:', istMidnightIso);
assert.equal(istMidnightIso, '2026-08-30T01:30:00.000+05:30');

const enquiryMidnight = formatEnquiredDateIST(utcLateNight);
console.log('Midnight crossing formatEnquiredDateIST output:', enquiryMidnight);
assert.match(enquiryMidnight, /^30 AUG 2026 , .* , 1:30 AM$/);

console.log('--- ALL TIMEZONE TESTS PASSED SUCCESSFULLY ---');
