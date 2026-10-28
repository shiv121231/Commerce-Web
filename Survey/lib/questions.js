export const YEARS = ['Year 7','Year 8','Year 9','Year 10','Year 11','Year 12'];
export const COPING = ['Nothing','Listening to Music','Breathing Exercises','Talk to Friends or Family','Fidget Items','Study More','Ask people around you for Help or Advice','Other'];
export const STATIONERY = ['Yes','No','Never thought of it'];
export const YNM = ['Yes','No','Maybe'];
// form field -> db column
export const YNM_COLS = {
  wantPen:'want_pen', favPen:'fav_pen', customPens:'custom_pens', annoyed:'annoyed', usedToy:'used_toy',
  toyHelps:'toy_helps', quotesInspire:'quotes_inspire', quotesHelp:'quotes_help', gripFocus:'grip_focus', quotePenCalm:'quote_pen_calm'
};

export function validate(b) {
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const int15 = (v) => Number.isInteger(v) && v >= 1 && v <= 5;
  const name = str(b.name, 80);
  if (!name) return { ok: false, error: 'Name is required' };
  if (!YEARS.includes(b.year)) return { ok: false, error: 'Invalid year' };
  if (!int15(b.stressFreq) || !int15(b.stressImpact)) return { ok: false, error: 'Scales must be 1-5' };
  if (!Array.isArray(b.coping) || !b.coping.length || b.coping.length > COPING.length) return { ok: false, error: 'Pick at least one coping option' };
  const coping = [...new Set(b.coping)];
  if (!coping.every((c) => COPING.includes(c))) return { ok: false, error: 'Invalid coping option' };
  const copingOther = coping.includes('Other') ? str(b.copingOther, 120) : '';
  if (coping.includes('Other') && !copingOther) return { ok: false, error: 'Please describe "Other"' };
  if (!STATIONERY.includes(b.calmStationery)) return { ok: false, error: 'Invalid answer' };
  const ynm = {};
  for (const [f, col] of Object.entries(YNM_COLS)) {
    if (!YNM.includes(b[f])) return { ok: false, error: 'Missing answer: ' + f };
    ynm[col] = b[f];
  }
  return { ok: true, value: { name, year: b.year, stress_freq: b.stressFreq, stress_impact: b.stressImpact,
    coping: JSON.stringify(coping), coping_other: copingOther, calm_stationery: b.calmStationery, ...ynm } };
}
