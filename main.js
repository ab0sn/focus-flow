'use strict';

const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── Single Instance Lock ───────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// ─── Global Window References ───────────────────────────────────────────────
let mainWin = null;
let isIsland = false;

// Store normal window bounds for restoring after island mode
let normalBounds = null;

// ─── Helpers ────────────────────────────────────────────────────────────────
function getPreloadPath() {
  return path.join(__dirname, 'preload.js');
}

function getIndexPath() {
  return path.join(__dirname, 'index.html');
}

// ─── Create Main Window ──────────────────────────────────────────────────────
function createWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = Math.min(1280, sw);
  const winH = Math.min(800, sh);

  mainWin = new BrowserWindow({
    width: winW,
    height: winH,
    minWidth: 480,
    minHeight: 360,
    center: true,
    frame: false,          // Custom titlebar in renderer
    transparent: false,
    backgroundColor: '#0a0a0c',
    show: false,           // Show after ready-to-show
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,       // Needed for require('electron') in renderer
      contextIsolation: false,     // Needed for require() in renderer
      webSecurity: false,          // Needed for file:// fonts and local resources
      allowRunningInsecureContent: false,
    }
  });

  mainWin.loadFile(getIndexPath());

  // Show window smoothly when ready
  mainWin.once('ready-to-show', () => {
    mainWin.show();
    mainWin.focus();
  });

  // Forward window state changes to renderer
  const sendState = (state) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('window-state-changed', state);
    }
  };

  mainWin.on('maximize', () => sendState('maximized'));
  mainWin.on('unmaximize', () => sendState('normal'));
  mainWin.on('enter-full-screen', () => sendState('fullscreen'));
  mainWin.on('leave-full-screen', () => sendState('normal'));
  mainWin.on('restore', () => sendState('normal'));

  // Second instance focus
  app.on('second-instance', () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  // Clean up on close
  mainWin.on('closed', () => {
    mainWin = null;
  });

  return mainWin;
}

// ─── IPC Handlers ───────────────────────────────────────────────────────────

// Window control
ipcMain.on('window-minimize', () => {
  if (mainWin) mainWin.minimize();
});

ipcMain.on('window-maximize', () => {
  if (!mainWin) return;
  if (mainWin.isMaximized()) {
    mainWin.unmaximize();
  } else {
    mainWin.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWin) mainWin.close();
});

// Dynamic Island toggle
ipcMain.on('toggle-dynamic-island', (event, enable) => {
  if (!mainWin) return;

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  if (enable) {
    // Save current bounds before entering island mode
    if (!mainWin.isFullScreen() && !mainWin.isMaximized()) {
      normalBounds = mainWin.getBounds();
    }

    isIsland = true;

    const islandW = 380;
    const islandH = 54;
    const islandX = Math.round((sw - islandW) / 2);
    const islandY = 0;

    mainWin.setAlwaysOnTop(true, 'pop-up-menu');
    mainWin.setResizable(false);
    mainWin.setMovable(false);
    mainWin.setSkipTaskbar(true);
    mainWin.setMinimumSize(islandW, islandH);

    if (mainWin.isFullScreen()) mainWin.setFullScreen(false);
    if (mainWin.isMaximized()) mainWin.unmaximize();

    mainWin.setBounds({ x: islandX, y: islandY, width: islandW, height: islandH }, true);

  } else {
    // Restore normal window
    isIsland = false;

    mainWin.setAlwaysOnTop(false);
    mainWin.setResizable(true);
    mainWin.setMovable(true);
    mainWin.setSkipTaskbar(false);
    mainWin.setMinimumSize(480, 360);

    const restore = normalBounds || {
      x: Math.round((sw - 1280) / 2),
      y: Math.round((sh - 800) / 2),
      width: 1280,
      height: 800
    };

    mainWin.setBounds(restore, true);
    normalBounds = null;
  }
});

// Save settings (persisted to localStorage by renderer, this is a no-op hook)
ipcMain.on('save-settings', (event, settings) => {
  // Settings are persisted by the renderer via localStorage.
  // This handler exists in case you want to do something extra
  // (e.g. write to a config file for next launch).
});

// Open external links
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

// Open folder in explorer
ipcMain.on('open-folder', (event, folderPath) => {
  shell.openPath(folderPath);
});

// ─── App Events ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── Disable navigation (security) ──────────────────────────────────────────
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const appUrl = 'file://';
    if (!url.startsWith(appUrl) && !url.startsWith('devtools://')) {
      event.preventDefault();
    }
  });

  contents.setWindowOpenHandler(({ url }) => {
    // Open any external links in the system browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});
