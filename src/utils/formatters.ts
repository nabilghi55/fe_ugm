/**
 * Formats asset brand, model, and optional variant cleanly without duplicating the brand name.
 * e.g., brand: 'Asus', model: 'Asus Vivobook' -> 'Asus Vivobook' (not 'Asus Asus Vivobook')
 * e.g., brand: 'Samsung', model: 'Galaxy A55 5G' -> 'Samsung Galaxy A55 5G'
 */
export const getAssetDisplayName = (brand?: string, model?: string, variant?: string): string => {
  const b = (brand || '').trim();
  const m = (model || '').trim();
  const v = (variant || '').trim();

  let name = '';
  if (!b && !m) {
    name = 'Barang Agunan';
  } else if (!b) {
    name = m;
  } else if (!m) {
    name = b;
  } else if (m.toLowerCase().startsWith(b.toLowerCase())) {
    name = m;
  } else {
    name = `${b} ${m}`;
  }

  return v ? `${name} ${v}`.trim() : name;
};
