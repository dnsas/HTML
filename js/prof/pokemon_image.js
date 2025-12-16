console.log("Chargement du module images Pokémon");


const originalAfficher = window.afficherResultatsRequete;
window.afficherResultatsRequete = function(enregistrements) {
    originalAfficher.call(this, enregistrements);
    ajouterImagesPokemon();
};

// Ajouter les images dans le tab
function ajouterImagesPokemon() {
    const tbody = document.querySelector('.affichageBD tbody');
    if (!tbody) return;

    tbody.querySelectorAll('tr').forEach(ligne => {
        const cellules = ligne.querySelectorAll('td');


        cellules.forEach(cellule => {
            const texte = cellule.textContent.trim();
            if (/^\d+$/.test(texte)) {
                const img = document.createElement('img');
                img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${texte}.png`;
                img.alt = `Pokémon ${texte}`;
                img.classList.add('pokemon-image');
                cellule.prepend(img);
            }
        });
    });
}