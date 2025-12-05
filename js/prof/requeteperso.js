// Sélecteurs
const selectRequete = document.getElementById('requete');
const zonePerso = document.getElementById('zonePerso');
const textareaSQL = document.getElementById('customSQL');

// Afficher ou cacher la zone personnalisée
selectRequete.addEventListener('change', function() {
    if (this.value === '__custom__') {
        zonePerso.style.display = 'block';
    } else {
        zonePerso.style.display = 'none';
    }
});

// Modifier la valeur envoyée au serveur
document.querySelector('.formulairePourBDProf').addEventListener('submit', function(evt) {
    if (selectRequete.value === '__custom__') {
        const champCaché = document.createElement('input');
        champCaché.type = 'hidden';
        champCaché.name = 'requete';
        champCaché.value = textareaSQL.value;
        this.appendChild(champCaché);
    }
});