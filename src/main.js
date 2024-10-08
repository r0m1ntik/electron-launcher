const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

let mainWindow;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        }
    });

    if (app.isPackaged) {
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        console.log('Chemin vers index.html:', indexPath);
        
        mainWindow.loadFile(indexPath)
            .then(() => console.log('Fichier index.html chargé avec succès'))
            .catch((err) => console.error('Erreur lors du chargement du fichier index.html :', err));
    } else {
        // Utilisé pour le développement
        mainWindow.loadURL('http://localhost:9000');
        console.log('Chargement depuis localhost...');
        mainWindow.webContents.openDevTools();
    }
}

// Sélection du répertoire de jeu
ipcMain.handle('dialog:selectDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (canceled) {
        return null;
    } else {
        return filePaths[0];
    }
});

// Vérification et téléchargement des fichiers
ipcMain.on('check-for-updates', async (event, localDirectory) => {
    try {
        // Appeler le serveur pour obtenir la liste des fichiers distants
        const response = await axios.get('https://dessower.ru/launcher/patches');
        const serverFiles = response.data;

        // Parcourir les fichiers locaux et comparer
        const missingOrUpdatedFiles = [];

        for (const serverFile of serverFiles) {
            const localFilePath = path.join(localDirectory, serverFile.path);

            if (!fs.existsSync(localFilePath)) {
                missingOrUpdatedFiles.push(serverFile); // Fichier manquant
            } else {
            const localFileMD5 = md5File(localFilePath);
            if (localFileMD5 !== serverFile.md5) {
                missingOrUpdatedFiles.push(serverFile); // Fichier modifié
            }
        }
    }

    // Renvoyer la liste des fichiers à télécharger au frontend
    event.sender.send('update-available', missingOrUpdatedFiles);

    } catch (error) {
        console.error('Erreur lors de la vérification des fichiers :', error);
    }
});

// Téléchargement d'un fichier
ipcMain.on('download-file', async (event, file) => {
    const downloadUrl = `https://dessower.ru/launcher/patches/${file.path}`;
    const localFilePath = path.join(localDirectory, file.path);

    try {
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(localFilePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            event.sender.send('update-progress', { file: file.path, status: 'completed' });
        });

        writer.on('error', (err) => {
            console.error('Erreur lors du téléchargement du fichier :', err);
            event.sender.send('update-progress', { file: file.path, status: 'failed' });
        });

    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
        event.sender.send('update-progress', { file: file.path, status: 'failed' });
    }
});

app.whenReady().then(() => {
    createWindow();
});
