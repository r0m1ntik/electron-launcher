import React, { useState, useEffect } from 'react';

const App = () => {
    const [gamePath, setGamePath] = useState('');

    useEffect(() => {
        console.log('App React montée');
    }, []);

    const handleSelectDirectory = async () => {
        if (window.electronAPI) {
            console.log("API electronAPI appelée");
            const directory = await window.electronAPI.selectGameDirectory();
            if (directory) {
                setGamePath(directory);
            }
        } else {
            console.error('electronAPI non disponible');
        }
    };
    
    return (
        <div>
            <h1>Electron + React Launcher</h1>
            <button onClick={() => alert('Le bouton fonctionne!')}>Cliquez-moi</button>
            <button onClick={handleSelectDirectory}>Sélectionner le répertoire du jeu</button>
            {gamePath && <p>Chemin du jeu : {gamePath}</p>}
        </div>
    );
};
    
export default App;