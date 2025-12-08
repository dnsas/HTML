/** Comportements.js ******/

// --- Configuration des couleurs par type ---
const typeColor = {
    bug: "#26de81",
    dragon: "#ffeaa7",
    electric: "#fed330",
    fairy: "#FF0069",
    fighting: "#30336b",
    fire: "#f0932b",
    flying: "#81ecec",
    grass: "#00b894",
    ground: "#EFB549",
    ghost: "#a55eea",
    ice: "#74b9ff",
    normal: "#95afc0",
    poison: "#6c5ce7",
    psychic: "#a29bfe",
    rock: "#2d3436",
    water: "#0190FF",
    default: "#eff3ff" // Couleur par défaut
};

// Fonction pour traduire les types de votre BDD (Français) vers les clés CSS (Anglais)
function mapTypeToColorKey(frenchType) {
    if (!frenchType) return "default";
    const map = {
        "Insecte": "bug",
        "Dragon": "dragon",
        "Electrique": "electric",
        "Fee": "fairy",
        "Fée": "fairy",
        "Combat": "fighting",
        "Feu": "fire",
        "Vol": "flying",
        "Plante": "grass",
        "Sol": "ground",
        "Spectre": "ghost",
        "Glace": "ice",
        "Normal": "normal",
        "Poison": "poison",
        "Psy": "psychic",
        "Roche": "rock",
        "Eau": "water"
    };
    return map[frenchType] || "normal";
}


// --- Programme principal ---
console.log("Exécution du programme javascript ");
const formulaires = document.querySelectorAll('form');
formulaires.forEach(unFormulaire => unFormulaire.addEventListener("submit", executerRequete));


/*** Gestionnaire d'événement **/
function executerRequete(evt) {
    console.log("Le formulaire a été validé");
    evt.preventDefault();

    const formulaireValidé = evt.target;
    let BDLocale = false;
    let erreurDeBD = false;

    // Détection de la base de données
    if (formulaireValidé.classList.contains("formulairePourBDEtudiant")) {
        BDLocale = true;
    } else if (!formulaireValidé.classList.contains("formulairePourBDProf")) {
        erreurDeBD = true;
    }

    // Nettoyage de l'interface
    const conteneurResultats = document.querySelector('.affichageBD');
    conteneurResultats.innerHTML = '';
    if (document.querySelector('.messageErreur')) {
        document.querySelector('.messageErreur').remove();
    }

    // Récupération de la requête
    const elementDeSaisieRadio = formulaireValidé.querySelector('[name=requete]:checked');
    let texteRequete = elementDeSaisieRadio ?
        elementDeSaisieRadio.value :
        formulaireValidé.querySelector('[name=requete]').value;

    let adresseDesDonnees = BDLocale ? "php/soumettreRequete.php" : "http://192.168.150.200/api/soumettreRequete.php";

    if (!erreurDeBD) {
        let donneesDuFormulaire = new FormData();
        donneesDuFormulaire.append("texteRequete", texteRequete)

        const optionsAjax = {
            "method": "POST",
            "body": donneesDuFormulaire
        }

        fetch(adresseDesDonnees, optionsAjax)
            .then(response => response.json())
            .then(resultats => afficherResultatsRequete(resultats))
            .catch(erreur => afficherErreur("Je ne peux pas récupérer les données " + erreur));
    } else {
        afficherErreur("Base de données non identifiée.");
    }
}


function afficherResultatsRequete(enregistrements) {
    console.log("Données reçues : ", enregistrements);

    const conteneur = document.querySelector('.affichageBD');
    conteneur.innerHTML = '';

    if (!enregistrements || enregistrements.length === 0) {
        conteneur.innerHTML = '<p class="aucun-resultat">Aucun résultat trouvé.</p>';
        return;
    }

    // Pour chaque résultat SQL, on crée une carte
    enregistrements.forEach(function(data) {

        // --- 1. Extraction des données ---
        const id = data.id || data.ID || data.pokemon_id;
        const name = data.nom || data.NOM || data.libelle || "Inconnu";

        let typePrincipal = "Normal";
        if (data.type_libelle) typePrincipal = data.type_libelle;
        else if (data.libelle && !data.puissance) typePrincipal = data.libelle;

        const typeKey = mapTypeToColorKey(typePrincipal);
        const themeColor = typeColor[typeKey] || typeColor['normal'];

        const carte = document.createElement('div');
        carte.className = 'card';
        carte.style.background = `radial-gradient(circle at 50% 0%, ${themeColor} 36%, #ffffff 36%)`;

        let innerHTMLContent = '';

        const hpVal = data.hp || data.pv;
        if (hpVal) {
            innerHTMLContent += `
                <p class="hp">
                    <span>HP</span> ${hpVal}
                </p>`;
        } else {
            innerHTMLContent += `<div style="height: 35px;"></div>`;
        }

        const imgSrc = id ?
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` :
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";

        innerHTMLContent += `<img src="${imgSrc}" alt="${name}" />`;
        innerHTMLContent += `<h2 class="poke-name">${name}</h2>`;

        if (typePrincipal && typePrincipal !== "Inconnu" && typePrincipal !== name) {
            innerHTMLContent += `
                <div class="types">
                    <span style="background-color: ${themeColor};">${typePrincipal}</span>
                </div>`;
        } else {
            innerHTMLContent += `<div class="types" style="height:28px"></div>`;
        }

        const attack = data.attaque || data.attack || data.puissance;
        const defense = data.defense;
        const speed = data.vitesse || data.speed;

        if (attack !== undefined || defense !== undefined || speed !== undefined) {
            innerHTMLContent += `<div class="stats">`;

            if (attack !== undefined) {
                innerHTMLContent += `
                    <div>
                        <h3>${attack}</h3>
                        <p>Attaque</p>
                    </div>`;
            }
            if (defense !== undefined) {
                innerHTMLContent += `
                    <div>
                        <h3>${defense}</h3>
                        <p>Défense</p>
                    </div>`;
            }
            if (speed !== undefined) {
                innerHTMLContent += `
                    <div>
                        <h3>${speed}</h3>
                        <p>Vitesse</p>
                    </div>`;
            }
            innerHTMLContent += `</div>`;
        } else {
            let extraInfo = "";
            for (const [key, value] of Object.entries(data)) {
                if (!['id', 'ID', 'nom', 'NOM', 'libelle', 'hp', 'attaque', 'defense', 'vitesse'].includes(key)) {
                    extraInfo += `<p style="font-size:12px; color:#666; text-align:center;">${key}: ${value}</p>`;
                }
            }
            if (extraInfo) innerHTMLContent += `<div style="margin-top:15px; border-top:1px solid #eee; padding-top:5px;">${extraInfo}</div>`;
        }

        carte.innerHTML = innerHTMLContent;
        conteneur.appendChild(carte);
    });
}

function afficherErreur(texteErreur) {
    let paragraphe = document.createElement('p')
    paragraphe.textContent = texteErreur;
    paragraphe.classList.add("messageErreur");
    document.querySelector('.affichageDesErreurs').append(paragraphe);
}