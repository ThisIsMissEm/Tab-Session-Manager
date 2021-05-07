import browser from "webextension-polyfill";
import log from "loglevel";
import getSessions from "./getSessions";
import { compressDataUrl } from "../common/compressDataUrl";
import { updateSession } from "./save";

const logDir = "background/compressAllSessions";

export const compressAllSessions = async () => {
  log.log(logDir, "compressAllSessions()");

  const sessions = await getSessions();
  const beforeSessionsSize = calcSessionsSize(sessions);

  for (let session of sessions) {
    await compressSession(session);
  }

  const afterSessions = await getSessions();
  const afterSessionsSize = calcSessionsSize(afterSessions);
  log.log(logDir, "=>compressAllSessions()", beforeSessionsSize, afterSessionsSize);
};

const calcSessionsSize = (sessions) => {
  const blob = new Blob([JSON.stringify(sessions, null, "  ")], { type: "aplication/json" });
  return blob.size;
};

const compressSession = async (session) => {
  log.log(logDir, "compressSession()", session.id);

  for (let winId in session.windows) {
    for (let tabId in session.windows[winId]) {
      let tab = session.windows[winId][tabId];
      if (tab?.favIconUrl?.startsWith("data:image")) {
        const compressedDataUrl = await compressDataUrl(tab.favIconUrl);
        tab.favIconUrl = compressedDataUrl;
        session.windows[winId][tabId] = tab;
      }
    }
  }

  updateSession(session, false, false);
};