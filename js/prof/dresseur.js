/**
 * @param {Object} data - Données SQL (pokemon_id, pokemon_nom, dresseur_id, dresseur_nom)
 * @returns {string} - HTML complet
 */
function genererCarteDresseurHTML(data) {
    const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
    const imgPokemon = `${baseUrl}${data.pokemon_id}.png`;

    // Insertion dynamique de l'ID du dresseur
    const imgDresseur = `/css/prof/images/dresseurs/${data.dresseur_id}.png`;

    return `
    <div class="flip-card-inner">
        <div class="flip-card-front">
            <div>
                <p class="hp" style="background-color:#121212; color:white;"><span>Pokemon</span></p>
                <img src="${imgPokemon}" alt="${data.pokemon_nom}" style="width: 150px; margin: 20px auto; display:block;">
                <h2 class="poke-name" style="color: black;">${data.pokemon_nom}</h2>
            </div>
            
            <div class="btn-evolution" onclick="basculerCarte(this)">
                <span></span>
                <button>
                    Voir le Dresseur
                </button>
            </div>
        </div>

        <div class="flip-card-back flip-card-trainer" style="background-color:#121212; color:white;">
            <div>
                <p class="hp" style="background-color:#121212; color:white;"><span>DRESSEUR</span></p>
                
                <img src="${imgDresseur}" alt="${data.dresseur_nom}" 
                     style="width: 200px; height: 200px; object-fit: contain; margin: 15px auto; display:block; filter: drop-shadow(0 0 12px rgba(0,0,0,0.2));"
                     onerror="this.src='/css/prof/images/pokemon.png';"> 
                
                <h2 class="poke-name" style="color: black; margin-top: 10px;">${data.dresseur_nom}</h2>
            </div>

            <button class="btn-retour" onclick="basculerCarte(this)">
                ↺ Retour
            </button>
        </div>
    </div>
    `;
}