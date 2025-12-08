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

            // Récupérer les valeurs du formulaire
            const nom = this.querySelector('.nom').value;
            const prenom = this.querySelector('.prenom').value;
            const classe = this.querySelector('.classe').value;

            console.log(`Données récupérées: ${nom}, ${prenom}, ${classe}`);

            // Vérifier que tous les champs sont remplis
            if (!nom || !prenom || !classe) {
                afficherErreurQR("Tous les champs sont obligatoires");
                return;
            }

            // Construire la requête SQL INSERT
            const requeteSQL = `INSERT INTO eleves (nom, prenom, classe, dateCreation) VALUES ('${nom}', '${prenom}', '${classe}', CURDATE())`;
            console.log("Requête SQL générée:", requeteSQL);

            // Afficher le spinner de chargement
            const spinner = document.getElementById('loading-spinner');
            if (spinner) {
                spinner.style.display = 'block';
            }

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
                        afficherMessageQR(`✅ Élève ajouté avec succès! ${resultats.message || ''}`, 'success');

                        // Générer le QR code (si votre code home.monqr.js le fait)
                        // Vous pourriez appeler une fonction de home.monqr.js ici

                        // Réinitialiser le formulaire
                        this.reset();

                        // Exécuter une requête SELECT pour afficher les données mises à jour
                        executerSelectApresInsert();
                    } else {
                        afficherErreurQR("❌ Erreur: " + (resultats.message || resultats.error));
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

    // Fonction pour exécuter un SELECT après un INSERT réussi
    function executerSelectApresInsert() {
        console.log("Exécution d'un SELECT pour rafraîchir les données");

        const requeteSelect = "SELECT * FROM eleves ORDER BY dateCreation DESC LIMIT 10";
        const formData = new FormData();
        formData.append("texteRequete", requeteSelect);

        // Utiliser le fichier PHP existant pour les SELECT
        fetch('/php/soumettreRequete1.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(resultats => {
                if (resultats.success && resultats.data && resultats.data.length > 0) {
                    // Afficher les résultats dans un tableau simple
                    afficherResultatsSimples(resultats.data);
                }
            })
            .catch(erreur => console.error("Erreur SELECT:", erreur));
    }

    // Fonction pour afficher les résultats simplement
    function afficherResultatsSimples(data) {
        const container = document.querySelector('.affichageBD');
        if (!container) return;

        container.style.display = 'block';
        const table = container.querySelector('table');
        table.innerHTML = '';

        // Créer l'en-tête
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        if (data.length > 0) {
            const keys = Object.keys(data[0]);
            keys.forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Créer le corps
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
    }

    // Fonctions d'affichage de messages
    function afficherMessageQR(message, type) {
        const container = document.querySelector('.affichageDesErreurs');
        if (!container) return;

        // Supprimer les anciens messages
        const anciensMessages = container.querySelectorAll('.message-qr');
        anciensMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            background-color: ${type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#bee5eb'};
        `;

        container.appendChild(messageDiv);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    function afficherErreurQR(message) {
        afficherMessageQR(message, 'error');
    }
});