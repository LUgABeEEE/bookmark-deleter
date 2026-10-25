/**
 * Pure helpers, kept free of chrome.* so they can be tested with node --test.
 */

/** Collect bookmark ids whose URL is in the dead-link list. */
export function collectMatches(nodes, deadUrls) {
  const out = [];
  const walk = (list) => {
    for (const node of list) {
      if (node.url && deadUrls.includes(node.url)) out.push(node.id);
      if (node.children) walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

/** Normalise a user-edited list: strings only, trimmed, de-duplicated. */
export function normaliseList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const url = raw.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}
