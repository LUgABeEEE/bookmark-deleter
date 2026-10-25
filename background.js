// Dead link URLs live in deadlinks.json next to this file. Edit that list,
// click "Reload" on the extensions page, and the extension picks it up.
//
// Behaviour:
//  - 3s after the worker starts: SCAN ONLY — bookmarks whose URL exactly matches
//    an entry in deadlinks.json are counted and shown on the toolbar badge.
//    Nothing is deleted.
//  - Click the toolbar icon once  -> arms deletion (badge turns red "OK?").
//  - Click the toolbar icon again -> deletes the matched bookmarks.
//  A single stray click can never delete anything: the first click only arms.

import { collectMatches, normaliseList } from "./lib/match.js";

const CONFIRM_BADGE = "OK?";
let deadUrls = [];
let matchedIds = [];
let armed = false;

async function loadDeadUrls() {
  try {
    const res = await fetch(chrome.runtime.getURL("deadlinks.json"));
    deadUrls = normaliseList(await res.json());
  } catch (e) {
    console.error(`[ERROR] failed to load deadlinks.json: ${e.message}`);
    deadUrls = [];
  }
}

async function scan() {
  const tree = await chrome.bookmarks.getTree();
  matchedIds = collectMatches(tree, deadUrls);
  console.log(`[SCAN] ${matchedIds.length} bookmark(s) match deadlinks.json (not deleted)`);
  await chrome.action.setBadgeText({ text: matchedIds.length ? String(matchedIds.length) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#888888" });
  return matchedIds;
}

async function deleteMatches() {
  let deleted = 0;
  for (const id of matchedIds) {
    try {
      await chrome.bookmarks.remove(id);
      deleted++;
    } catch (e) {
      console.error(`[ERROR] remove ${id}: ${e.message}`);
    }
  }
  console.log(`=== DONE === Deleted: ${deleted}`);
  matchedIds = [];
  await chrome.action.setBadgeText({ text: "" });
}

// Scan (mark only) shortly after startup — never auto-delete.
setTimeout(async () => {
  await loadDeadUrls();
  await scan();
}, 3000);

// Two-click confirmation through the toolbar action (no extra permissions).
chrome.action.onClicked.addListener(async () => {
  if (!deadUrls.length) await loadDeadUrls();
  if (!matchedIds.length) await scan();
  if (!matchedIds.length) {
    console.log("[ACTION] nothing to delete");
    return;
  }
  if (!armed) {
    armed = true;
    await chrome.action.setBadgeText({ text: CONFIRM_BADGE });
    await chrome.action.setBadgeBackgroundColor({ color: "#d93025" });
    console.log(`[ACTION] armed: ${matchedIds.length} match(es). Click again to confirm deletion.`);
    return;
  }
  armed = false;
  await deleteMatches();
});
