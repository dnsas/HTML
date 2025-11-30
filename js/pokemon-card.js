// pokemon-card.js - Gestion des cartes Pokémon
console.log("Chargement de pokemon-card.js");

function afficherCartesPokemon(enregistrements) {
    console.log("Affichage des cartes Pokémon avec", enregistrements.length, "enregistrements");

    const container = document.getElementById('pokemon-cards-container');
    if (!container) {
        console.error("Conteneur pokemon-cards-container introuvable");
        return;
    }

    // Vider le conteneur
    container.innerHTML = '';

    if (!enregistrements || enregistrements.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun Pokémon trouvé</p>';
        return;
    }

    // Créer une carte pour chaque Pokémon
    enregistrements.forEach((pokemon, index) => {
        const carte = creerCartePokemon(pokemon, index);
        container.appendChild(carte);
    });

    // Mettre à jour le compteur
    mettreAJourCompteurPokemon(enregistrements.length);
}

function creerCartePokemon(pokemonData, index) {
    const carte = document.createElement('div');
    carte.className = 'pokemon-card';
    carte.setAttribute('data-pokemon-id', index);

    // Créer le contenu HTML de la carte
    let contenuHTML = `
        <div class="pokemon-card-inner">
            <div class="pokemon-card-front">
                <div class="pokemon-header">
                    <h3 class="pokemon-nom">${pokemonData.nom || 'Nom inconnu'}</h3>
                </div>
                <div class="pokemon-info">`;

    // Ajouter toutes les propriétés du Pokémon (sauf 'nom' déjà affiché)
    for (const [key, value] of Object.entries(pokemonData)) {
        if (key !== 'nom') {
            contenuHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    }

    contenuHTML += `
                </div>
                <button class="view-details-btn" onclick="retournerCartePokemon(this)">Voir détails</button>
            </div>
            <div class="pokemon-card-back">
                <div class="pokemon-details">
                    <h4>Détails complets</h4>`;

    // Afficher tous les détails au dos
    for (const [key, value] of Object.entries(pokemonData)) {
        contenuHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    }

    contenuHTML += `
                </div>
                <button class="return-btn" onclick="retournerCartePokemon(this)">Retour</button>
            </div>
        </div>
    `;

    carte.innerHTML = contenuHTML;
    return carte;
}

function retournerCartePokemon(bouton) {
    const carte = bouton.closest('.pokemon-card');
    if (carte) {
        carte.classList.toggle('flipped');
    }
}

function mettreAJourCompteurPokemon(nombre) {
    let compteur = document.getElementById('pokemon-counter');
    if (!compteur) {
        compteur = document.createElement('div');
        compteur.id = 'pokemon-counter';
        compteur.className = 'pokemon-counter';
        const container = document.querySelector('.affichageBD');
        if (container) {
            container.parentNode.insertBefore(compteur, container);
        }
    }
    compteur.textContent = `Nombre de Pokémon : ${nombre}`;
}