/** File: desktop/preload.cjs
 * Author: Jason Stys
 * Purpose: Expose only five owned-window design operations, never raw IPC, Node, paths or capabilities.
 * Functions/state: frozen designStudio bridge; exact sender/arguments are verified by the main owner.
 */
"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "designStudio",
  Object.freeze({
    load: () => ipcRenderer.invoke("ads:load"),
    save: (request) => ipcRenderer.invoke("ads:save", request),
    importProject: () => ipcRenderer.invoke("ads:import"),
    exportFile: (request) => ipcRenderer.invoke("ads:export", request),
    quit: () => ipcRenderer.invoke("ads:quit"),
  }),
);
