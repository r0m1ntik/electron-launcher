const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script chargé');

contextBridge.exposeInMainWorld('electronAPI', {
    selectGameDirectory: () => {
        console.log('API electronAPI appelée');
        return ipcRenderer.invoke('dialog:selectDirectory');
    }
});