const { contextBridge, ipcRenderer } = require('electron');

// API fonksiyonlarını expose et
contextBridge.exposeInMainWorld('api', {
    saveConfig: async (config) => {
        try {
            console.log('saveConfig çağrıldı:', config);
            const result = await ipcRenderer.invoke('saveConfig', config);
            console.log('saveConfig sonucu:', result);
            return result;
        } catch (error) {
            console.error('saveConfig hatası:', error);
            throw error;
        }
    },
    startApp: async () => {
        try {
            console.log('startApp çağrıldı');
            const result = await ipcRenderer.invoke('startApp');
            console.log('startApp sonucu:', result);
            return result;
        } catch (error) {
            console.error('startApp hatası:', error);
            throw error;
        }
    }
}); 