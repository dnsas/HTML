// pokemon-card.js - Affichage des Pokémon en cartes pour le Pokédex

// Surcharger la fonction d'affichage pour créer des cartes au lieu d'un tableau
const originalAfficher = window.afficherResultatsRequete;

window.afficherResultatsRequete = function(enregistrements) {
    // Si c'est une requête Pokémon, afficher en cartes
    if (estRequetePokemon(enregistrements)) {
        afficherPokemonEnCartes(enregistrements);
    } else {
        // Sinon, utiliser l'affichage tableau original
        originalAfficher.call(this, enregistrements);
    }
};

// Vérifier si c'est une requête Pokémon
function estRequetePokemon(enregistrements) {
    if (!enregistrements || enregistrements.length === 0) return false;

    const premierEnregistrement = enregistrements[0];
    return premierEnregistrement.hasOwnProperty('id') ||
        premierEnregistrement.hasOwnProperty('nom') ||
        premierEnregistrement.hasOwnProperty('type1');
}

// Afficher les Pokémon en cartes
function afficherPokemonEnCartes(enregistrements) {
    console.log("Affichage des Pokémon en cartes");

    const container = document.querySelector('.affichageBD');
    container.innerHTML = '';

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'pokemon-cards-container';

    enregistrements.forEach(pokemon => {
        const card = creerCartePokemon(pokemon);
        cardsContainer.appendChild(card);
    });

    container.appendChild(cardsContainer);
}

// Créer une carte Pokémon individuelle
function creerCartePokemon(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    // Récupérer l'ID du Pokémon (s'adapte à différentes structures de données)
    const pokemonId = pokemon.id || pokemon.numero || extraireId(pokemon);

    // Structure HTML de la carte
    card.innerHTML = `
        <img class="pokemon-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png" 
             alt="${pokemon.nom}" 
             onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png'">
        <div class="pokemon-name">${pokemon.nom}</div>
        <div class="pokemon-types"></div>
        <div class="pokemon-stats">
            ${creerStatsHTML(pokemon)}
        </div>
    `;

    // Ajouter les types
    ajouterTypesPokemon(card, pokemon);

    return card;
}

// Extraire l'ID du Pokémon de différentes manières
function extraireId(pokemon) {
    // Si l'ID est dans une cellule de tableau
    if (pokemon['#']) return pokemon['#'];

    // Essayer de trouver un champ numérique
    for (let key in pokemon) {
        if (/^\d+$/.test(pokemon[key])) {
            return pokemon[key];
        }
    }

    // Retourner un ID par défaut (premier Pokémon)
    return 1;
}

// Créer le HTML pour les statistiques
function creerStatsHTML(pokemon) {
    const stats = [
        { label: 'PV', value: pokemon.pv || pokemon.hp || Math.floor(Math.random() * 100) + 50 },
        { label: 'Attaque', value: pokemon.attaque || pokemon.attack || Math.floor(Math.random() * 100) + 30 },
        { label: 'Défense', value: pokemon.defense || Math.floor(Math.random() * 100) + 30 },
        { label: 'Vitesse', value: pokemon.vitesse || pokemon.speed || Math.floor(Math.random() * 100) + 30 }
    ];

    return stats.map(stat => `
        <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${Math.min(stat.value, 100)}%; background-color: ${getStatColor(stat.value)}"></div>
            </div>
        </div>
    `).join('');
}

// Obtenir la couleur en fonction de la statistique
function getStatColor(value) {
    if (value >= 80) return '#4CAF50'; // Vert
    if (value >= 60) return '#FFC107'; // Jaune
    if (value >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Rouge
}

// Ajouter les types du Pokémon
function ajouterTypesPokemon(card, pokemon) {
    const typesContainer = card.querySelector('.pokemon-types');

    // Déterminer les types en fonction des données disponibles
    const types = [];

    if (pokemon.type1) types.push(pokemon.type1.toLowerCase());
    if (pokemon.type2) types.push(pokemon.type2.toLowerCase());

    // Si pas de types spécifiés, utiliser des types aléatoires
    if (types.length === 0) {
        const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
        types.push(allTypes[Math.floor(Math.random() * allTypes.length)]);
    }

    // Créer les éléments de type
    types.forEach(type => {
        const typeElement = document.createElement('span');
        typeElement.className = `pokemon-type type-${type}`;
        typeElement.textContent = type;
        typesContainer.appendChild(typeElement);
    });
}

// Fonction pour charger les données détaillées d'un Pokémon depuis l'API
function chargerDetailsPokemon(pokemonId) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
        .then(response => response.json())
        .then(data => {
            return {
                types: data.types.map(t => t.type.name),
                stats: data.stats.reduce((acc, stat) => {
                    acc[stat.stat.name] = stat.base_stat;
                    return acc;
                }, {})
            };
        })
        .catch(error => {
            console.error('Erreur chargement détails Pokémon:', error);
            return null;
        });
}