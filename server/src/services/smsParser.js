/**
 * Parse Indian bank/UPI SMS text to transaction object.
 * @param {string} smsText
 * @returns {{amount:number,type:'debit'|'credit',merchant:string,account_masked:string|null,date:string,raw_sms:string}|null}
 */
export function parseSMS(smsText) {
  if (!smsText) return null;
  const text = smsText.replace(/\s+/g, ' ').trim();

  const patterns = [
    /(?:Rs\.?|INR)\s?([\d,]+(?:\.\d{1,2})?).*?(debited|credited).*?(?:A\/?c|account)\s*([Xx*\d]{4,})?.*?(?:for|to)\s*([\w@._ -]+).*?(?:on\s*(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?))?/i,
    /You paid\s(?:Rs\.?|INR)?\s?([\d,]+(?:\.\d{1,2})?)\s+to\s+([\w@._-]+)\s+on\s+(PhonePe|GPay|Paytm)/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (!m) continue;

    if (m[3] && m[4]) {
      return {
        amount: Number(m[1].replace(/,/g, '')),
        type: m[2].toLowerCase().includes('debit') ? 'debit' : 'credit',
        account_masked: m[3] || null,
        merchant: m[4]?.trim() || 'Unknown',
        date: normalizeDate(m[5]),
        raw_sms: smsText
      };
    }

    return {
      amount: Number(m[1].replace(/,/g, '')),
      type: 'debit',
      account_masked: null,
      merchant: m[2],
      date: new Date().toISOString().slice(0, 10),
      raw_sms: smsText
    };
  }

  return null;
}

function normalizeDate(input) {
  if (!input) return new Date().toISOString().slice(0, 10);
  const [d, m, y] = input.split(/[-/]/).map(Number);
  const year = y || new Date().getFullYear();
  return new Date(year, (m || 1) - 1, d || 1).toISOString().slice(0, 10);
}
