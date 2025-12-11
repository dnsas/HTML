/* /js/prof/evolution.js */

/**
 * Fonction appelée par le bouton pour tourner la carte
 * Elle cherche le parent .flip-card-inner et toggle la classe .flipped
 */
function basculerCarte(bouton) {
    const carteInterieure = bouton.closest('.flip-card-inner');
    if (carteInterieure) {
        carteInterieure.classList.toggle('flipped');
    }
}

/**
 * Génère le HTML pour une carte à retourner (Flip Card)
 * @param {Object} data - Données SQL (BaseID, EvoID, Base, Evolution)
 * @returns {string} - HTML complet
 */
function genererCarteEvolutionHTML(data) {
    const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

    // Images
    const imgBase = data.BaseID ? `${baseUrl}${data.BaseID}.png` : "";
    const imgEvo = data.EvoID ? `${baseUrl}${data.EvoID}.png` : "";

    // On utilise ton style de gradient (couleur par défaut ici car pas de type dans la requête)
    const bgBase = `radial-gradient(circle at 50% 0%, #eff3ff 36%, #ffffff 36%)`;

    return `
    <div class="flip-card-inner">
        <div class="flip-card-front" style="background: ${bgBase}">
            <div>
                <p class="hp"><span>BASE</span></p>
                <img src="${imgBase}" alt="${data.Base}" style="width: 150px; margin: 20px auto; display:block;">
                <h2 class="poke-name">${data.Base}</h2>
            </div>
            
            <button class="btn-evolution" onclick="basculerCarte(this)">
                Voir Évolution ↻
            </button>
        </div>

        <div class="flip-card-back">
            <div>
                <p class="hp" style="background-color:#ffd700; color:black;"><span>EVO</span></p>
                <img src="${imgEvo}" alt="${data.Evolution}" style="width: 160px; margin: 20px auto; display:block;">
                <h2 class="poke-name" style="color: #d35400;">${data.Evolution}</h2>
            </div>

            <button class="btn-evolution btn-retour" onclick="basculerCarte(this)">
                ↺ Retour
            </button>
        </div>
    </div>
    `;
}