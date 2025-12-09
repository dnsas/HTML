// /js/eleve/FormulairePost.js
// Gestion spécifique pour le formulaire d'insertion d'élèves

document.addEventListener('DOMContentLoaded', function() {
    console.log("FormulairePost.js chargé - Gestion des formulaires d'insertion");

    // Cibler spécifiquement le formulaire de génération QR qui doit insérer des données
    const formulaireQR = document.querySelector('.formulairePourBDEtudiant.no-gestion-formulaire');

    if (formulaireQR) {
        formulaireQR.addEventListener('submit', function(evt) {
            console.log("Formulaire QR soumis (géré par FormulairePost.js)");
            evt.preventDefault();
            evt.stopImmediatePropagation(); // Empêche home.monqr.js de s'exécuter

            // Récupérer les valeurs du formulaire
            const nom = this.querySelector('.nom').value.trim();
            const prenom = this.querySelector('.prenom').value.trim();
            const classe = this.querySelector('.classe').value.trim();

            console.log(`Données récupérées: ${nom}, ${prenom}, ${classe}`);

            // Vérifier que tous les champs sont remplis
            if (!nom || !prenom || !classe) {
                afficherErreurQR("Veuillez remplir tous les champs !");
                return;
            }

            // Afficher le spinner de chargement
            const spinner = document.getElementById('loading-spinner');
            if (spinner) {
                spinner.style.display = 'block';
            }


            // Créer la date pour MySQL (format YYYY-MM-DD HH:MM:SS)
            const maintenant = new Date();
            const dateMySQL = maintenant.toISOString().slice(0, 19).replace('T', ' ');

            // Date formatée pour le QR Code
            const dateQR = maintenant.toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });


            // Construire la requête SQL INSERT
            const requeteSQL = `INSERT INTO eleves (nom, prenom, classe, dateCreation) VALUES ('${nom}', '${prenom}', '${classe}', '${dateMySQL}')`;
            console.log("Requête SQL générée:", requeteSQL);



            // Préparer les données à envoyer
            const formData = new FormData();
            formData.append("texteRequete", requeteSQL);

            // Utiliser le nouveau fichier PHP pour les INSERT
            fetch('/php/soumettreRequete2.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then(resultats => {
                    console.log("Réponse du serveur:", resultats);

                    if (resultats.success) {
                        // Afficher un message de succès
                        afficherMessageQR(`✅ Élève ajouté avec succès! `, 'success');
                        genererQRCodeApresInsertion(nom, prenom, classe, dateQR, resultats);
                        // Générer le QR code (si votre code home.monqr.js le fait)
                        // Vous pourriez appeler une fonction de home.monqr.js ici

                        // Réinitialiser le formulaire
                        //this.reset();

                        // Exécuter une requête SELECT pour afficher les données mises à jour

                    } else {
                        afficherErreurQR("❌ Erreur: " + (resultats.message || resultats.error), "danger");
                    }
                })
                .catch(erreur => {
                    afficherErreurQR("❌ Erreur de connexion: " + erreur.message);
                    console.error("Erreur fetch:", erreur);
                })
                .finally(() => {
                    // Cacher le spinner
                    if (spinner) {
                        spinner.style.display = 'none';
                    }
                });
        });
    }


    // Fonction pour générer le QR Code après insertion
    function genererQRCodeApresInsertion(nom, prenom, classe, dateQR, resultatsInsertion) {
        console.log("Déclenchement de la génération du QR Code...");

        // Créer un événement personnalisé avec les données
        const qrEvent = new CustomEvent('genererQRCode', {
            detail: {
                nom: nom,
                prenom: prenom,
                classe: classe,
                date: dateQR,
                insertionReussie: resultatsInsertion.success || false
            }
        });

        // Déclencher l'événement sur le document
        document.dispatchEvent(qrEvent);
    }


    // Fonctions d'affichage de messages
    function afficherMessageQR(message, type) {
        const container = document.querySelector('.alert-container');
        if (!container) return;

        // Supprimer les anciens messages
        const anciensMessages = container.querySelectorAll('.alert-container');
        anciensMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = ` alert alert-${type} show`;
        messageDiv.textContent = message;

        container.appendChild(messageDiv);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 45000);
    }

});