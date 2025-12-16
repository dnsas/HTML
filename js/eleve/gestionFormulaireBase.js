/** Comportements.js ******/
// Programme principal
console.log("Exécution du programme javascript ");
const formulaires = document.querySelectorAll('form');
formulaires.forEach(unFormulaire => unFormulaire.addEventListener("submit", executerRequete))

function executerRequete(evt) {
    console.log("Le formulaire a été validé");
    console.log(" => Exécution du gestionnaire d'événement executerRequete");
    evt.preventDefault();
    const formulaireValidé = evt.target;
    let BDLocale = false;
    let erreurDeBD = false;
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
    const enteteTableResultat = document.querySelector('.affichageBD thead');
    if (enteteTableResultat) {
        enteteTableResultat.remove();
    }
    if (document.querySelector('.affichageBD tbody')) {
        document.querySelector('.affichageBD tbody').remove();
    }
    if (document.querySelector('.messageErreur')) {
        document.querySelector('.messageErreur').remove();
    }
    const elementDeSaisieRadio = formulaireValidé.querySelector('[name=requete]:checked');
    let selecteurRequete;
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
        adresseDesDonnees = "/php/soumettreRequete1.php";
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

        fetch(adresseDesDonnees, optionsAjax)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur HTTP ' + response.status);
                }
                return response.json();
            })
            .then(resultats => {
                console.log("Réponse reçue:", resultats);

                if (resultats.success) {
                    afficherResultatsRequete(resultats.data);
                } else {
                    afficherErreur("Erreur: " + (resultats.message || resultats.error));
                }
            })
            .catch(erreur => {
                afficherErreur("Erreur lors de la récupération des données: " + erreur.message);
            });
    } else {
        afficherErreur("Le choix entre la base de données prof et votre base de données personnelle n'est pas clairement exprimé");
    }
    console.log("\t J'envoie la requête à l'adresse " + adresseDesDonnees);

    function afficherResultatsRequete(enregistrements) {
        console.log("L'appel Ajax permettant de récupérer les informations a fonctionné !");
        console.log("Voici la donnée fournie par le programme php en réponse à la requête : ");
        console.log(enregistrements);

        if (!Array.isArray(enregistrements)) {
            afficherErreur("Les données reçues ne sont pas un tableau valide");
            return;
        }

        if (enregistrements.length === 0) {
            afficherErreur("Aucun résultat trouvé pour cette requête");
            return;
        }

        const table = document.querySelector('.affichageBD table');

        table.innerHTML = '';

        const tbody = document.createElement('tbody');
        const thead = document.createElement('thead');

        let nomsDesChamps = Object.keys(enregistrements[0]);
        console.log("Voici les noms des champs récupérés grâce à la requête:", nomsDesChamps);

        const ligneEntete = document.createElement('tr');
        nomsDesChamps.forEach(function(unNomDeChamp) {
            let cellule = document.createElement('th');
            cellule.textContent = unNomDeChamp;
            ligneEntete.append(cellule);
        });

        thead.append(ligneEntete);
        table.append(thead);

        console.log("Nombre d'enregistrements:", enregistrements.length);

        enregistrements.forEach(function(unEnregistrement) {
            let ligne = document.createElement('tr');
            nomsDesChamps.forEach(function(unChamp) {
                let cellule = document.createElement('td');
                cellule.textContent = unEnregistrement[unChamp] !== null ? unEnregistrement[unChamp] : 'NULL';
                ligne.append(cellule);
            });
            tbody.append(ligne);
        });

        table.append(tbody);
    }

    function afficherErreur(texteErreur) {
        let paragraphe = document.createElement('p')
        paragraphe.textContent = texteErreur;
        paragraphe.classList.add("messageErreur");
        console.log("Il y a une erreur d'exécution :");
        console.log("\t" + texteErreur);
        document.querySelector('.affichageDesErreurs').append(paragraphe);
    }
}