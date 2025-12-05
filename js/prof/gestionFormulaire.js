/** Comportements.js ******/
// Programme principal

console.log("Exécution du programme javascript ");
const formulaires = document.querySelectorAll('form');
formulaires.forEach(unFormulaire => unFormulaire.addEventListener("submit", executerRequete));

/*** Gestionnaire d'événement **/
function executerRequete(evt) {
    console.log("Le formulaire a été validé");
    console.log(" => Exécution du gestionnaire d'événement executerRequete");

    evt.preventDefault();

    // Quel formulaire a été utilisé ?
    const formulaireValidé = evt.target;
    let BDLocale = false;
    let erreurDeBD = false;
    let BDAManipuler = ""; // Déclaration pour éviter les problèmes de portée

    if (formulaireValidé.classList.contains("formulairePourBDProf")) {
        BDAManipuler = "la base de données enseignant";
    } else {
        if (formulaireValidé.classList.contains("formulairePourBDEtudiant")) {
            BDAManipuler = "votre base de données personnelle";
            BDLocale = true;
        } else {
            BDAManipuler = "une base de données inconnue";
            erreurDeBD = true;
        }
    }

    console.log("Vous cherchez à manipuler " + BDAManipuler);

    // Supprimer les résultats précédents
    const conteneurResultats = document.querySelector('.affichageBD');
    conteneurResultats.innerHTML = ''; // Vide complètement le conteneur

    // Supprimer le message d'erreur éventuellement présent
    if (document.querySelector('.messageErreur')) {
        document.querySelector('.messageErreur').remove();
    }

    // Récupérer le texte de la requête
    const elementDeSaisieRadio = formulaireValidé.querySelector('[name=requete]:checked');
    let selecteurRequete;
    let texteRequete;

    if (elementDeSaisieRadio) {
        console.log("J'ai détecté une saisie par bouton radio");
        selecteurRequete = '[name=requete]:checked';
    } else {
        console.log("J'ai détecté une saisie par bouton liste déroulante ou champ textuel");
        selecteurRequete = '[name=requete]';
    }

    console.log("\t Voici le sélecteur CSS permettant d'atteindre l'élément html contenant le texte de la requête : " + selecteurRequete);
    texteRequete = formulaireValidé.querySelector(selecteurRequete).value;
    console.log("\t J'ai récupéré ce texte de requête : " + texteRequete);

    let adresseDesDonnees;
    if (BDLocale) {
        adresseDesDonnees = "php/soumettreRequete.php";
    } else {
        adresseDesDonnees = "http://192.168.150.200/api/soumettreRequete.php";
    }

    if (!erreurDeBD) {
        let donneesDuFormulaire = new FormData();
        donneesDuFormulaire.append("texteRequete", texteRequete)
        const optionsAjax = {
            "method": "POST",
            "body": donneesDuFormulaire
        }

        // envoie de la requête vers BDD
        fetch(adresseDesDonnees, optionsAjax)
            .then(response => response.json())
            .then(resultats => afficherResultatsRequete(resultats))
            .catch(erreur => afficherErreur("Je ne peux pas récupérer les données " + erreur));
    } else {
        afficherErreur("Le choix entre la base de données prof et votre base de données personnelle n'est pas clairement exprimé");
    }

    console.log("\t J'envoie la requête à l'adresse " + adresseDesDonnees);
}

function afficherResultatsRequete(enregistrements) {
    console.log("L'appel Ajax permettant de récupérer les informations a fonctionné !");
    console.log("Voici la donnée fournie par le programme php en réponse à la requête : ");
    console.log(enregistrements);

    const conteneur = document.querySelector('.affichageBD');
    conteneur.innerHTML = ''; // S'assurer qu'il est vide

    if (enregistrements.length === 0) {
        conteneur.innerHTML = '<p class="aucun-resultat">Aucun résultat trouvé.</p>';
        return;
    }

    // Récupérer les noms des champs
    let nomsDesChamps = Object.keys(enregistrements[0]);
    console.log("Voici les noms des champs récupérés grâce à la requête");

    // Créer le conteneur pour la grille
    const conteneurResultats = document.createElement('div');
    // ** Changement pour utiliser la classe de grille CSS **
    conteneurResultats.className = 'tokenmen-card-container';



    // Pour chaque enregistrement, créer une carte
    enregistrements.forEach(function(unEnregistrement) {
        const carte = document.createElement('div');
        carte.className = 'carte-pokemon';

        // Tenter de trouver l'ID et le Nom
        const pokemonId = unEnregistrement['id']
        const pokemonNom = unEnregistrement['nom'] || 'Pokémon Inconnu';

        // --- INJECTION DE L'IMAGE ET DU TITRE ---

        // 1. Ajouter l'image
        if (pokemonId) {
            const imageContainer = document.createElement('div');
            // 'image-simulee' est la classe CSS pour le fond coloré et le dimensionnement
            imageContainer.className = 'image-simulee';

            const img = document.createElement('img');
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
            img.alt = pokemonNom;
            img.classList.add('pokemon-image');

            imageContainer.appendChild(img);
            carte.appendChild(imageContainer);
        } else {
            // Ajouter un div de remplacement si l'ID est manquant
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-simulee';
            imageContainer.textContent = "Image non trouvée";
            carte.appendChild(imageContainer);
        }

        // 2. Ajouter le nom du Pokémon comme titre (première ligne stylisée)
        const titreNom = document.createElement('div');
        titreNom.textContent = pokemonNom.toUpperCase();
        carte.appendChild(titreNom);

        // --- FIN INJECTION ---

        // 3. Ajouter les autres données
        nomsDesChamps.forEach(function(unChamp) {
            // Optionnel : sauter les champs 'id' et 'nom' si déjà utilisés pour l'image et le titre
            if (['id', 'ID', 'pokemon_id', 'nom', 'NOM'].includes(unChamp)) {
                return;
            }

            const ligne = document.createElement('div');
            ligne.className = 'ligne-donnee';

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = unChamp + ' : ';

            const valeur = document.createElement('span');
            valeur.className = 'valeur';
            valeur.textContent = unEnregistrement[unChamp];

            ligne.appendChild(label);
            ligne.appendChild(valeur);
            carte.appendChild(ligne);
        });

        conteneurResultats.appendChild(carte);
    });

    conteneur.appendChild(conteneurResultats);
}

function afficherErreur(texteErreur) {
    let paragraphe = document.createElement('p')
    paragraphe.textContent = texteErreur;
    paragraphe.classList.add("messageErreur");
    console.log("Il y a une erreur d'exécution :");
    console.log("\t" + texteErreur);
    document.querySelector('.affichageDesErreurs').append(paragraphe);
}