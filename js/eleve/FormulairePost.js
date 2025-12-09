// /js/eleve/FormulairePost.js - Version adaptée avec spinner dans le bouton

document.addEventListener('DOMContentLoaded', function() {
    console.log("FormulairePost.js chargé - Gestion des formulaires d'insertion");

    const formulaireQR = document.querySelector('.formulairePourBDEtudiant.no-gestion-formulaire');
    const submitBtn = document.getElementById('submitBtn');

    if (formulaireQR) {
        formulaireQR.addEventListener('submit', function(evt) {
            console.log("Formulaire QR soumis (géré par FormulairePost.js)");
            evt.preventDefault();
            evt.stopImmediatePropagation();

            const nom = this.querySelector('.nom').value.trim();
            const prenom = this.querySelector('.prenom').value.trim();
            const classe = this.querySelector('.classe').value.trim();

            console.log(`Données récupérées: ${nom}, ${prenom}, ${classe}`);

            if (!nom || !prenom || !classe) {
                afficherMessageQR("Veuillez remplir tous les champs !", "danger");
                return;
            }

            // Activer le spinner DANS LE BOUTON ENVOYER
            showSubmitButtonSpinner();

            // Temps minimum d'affichage du spinner dans le bouton
            const tempsDebutSpinner = Date.now();
            const tempsMinimumSpinner = 2000; // 2 secondes minimum

            const maintenant = new Date();
            const dateMySQL = maintenant.toISOString().slice(0, 19).replace('T', ' ');
            const dateQR = maintenant.toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            const requeteSQL = `INSERT INTO eleves (nom, prenom, classe, dateCreation) VALUES ('${nom}', '${prenom}', '${classe}', '${dateMySQL}')`;
            console.log("Requête SQL générée:", requeteSQL);

            // Fonction pour masquer le spinner avec délai minimum
            function masquerSpinnerAvecDelai() {
                const tempsEcoule = Date.now() - tempsDebutSpinner;
                const tempsRestant = Math.max(0, tempsMinimumSpinner - tempsEcoule);

                setTimeout(() => {
                    hideSubmitButtonSpinner();
                    console.log("Spinner du bouton masqué après délai");
                }, tempsRestant);
            }

            const formData = new FormData();
            formData.append("texteRequete", requeteSQL);

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
                        afficherMessageQR(`✅ Élève ajouté avec succès! `, 'success');

                        // Réinitialiser le formulaire
                        this.reset();

                        // Délai supplémentaire avant de générer le QR Code
                        setTimeout(() => {
                            genererQRCodeApresInsertion(nom, prenom, classe, dateQR, resultats);
                        }, 500); // 0.5 seconde après la réponse

                    } else {
                        afficherMessageQR("❌ Erreur: " + (resultats.message || resultats.error), "danger");
                    }

                    masquerSpinnerAvecDelai();
                })
                .catch(erreur => {
                    afficherMessageQR("❌ Erreur de connexion: " + erreur.message, "danger");
                    console.error("Erreur fetch:", erreur);
                    masquerSpinnerAvecDelai();
                });
        });
    }

    // Fonctions pour gérer le spinner du bouton Envoyer
    function showSubmitButtonSpinner() {
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            console.log("Spinner activé dans le bouton Envoyer");
        }
    }

    function hideSubmitButtonSpinner() {
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            console.log("Spinner désactivé dans le bouton Envoyer");
        }
    }

    // Fonction pour générer le QR Code après insertion AVEC DÉLAI
    function genererQRCodeApresInsertion(nom, prenom, classe, dateQR, resultatsInsertion) {
        console.log("Déclenchement de la génération du QR Code...");

        // Délai avant de déclencher l'événement
        setTimeout(() => {
            console.log("Déclenchement de l'événement genererQRCode");

            const qrEvent = new CustomEvent('genererQRCode', {
                detail: {
                    nom: nom,
                    prenom: prenom,
                    classe: classe,
                    date: dateQR,
                    insertionReussie: resultatsInsertion.success || false
                }
            });

            document.dispatchEvent(qrEvent);

        }, 1000); // 1 seconde de délai
    }

    // Fonctions d'affichage de messages
    function afficherMessageQR(message, type) {
        const container = document.querySelector('.alert-container');
        if (!container) return;

        const anciensMessages = container.querySelectorAll('.alert');
        anciensMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} show`;
        messageDiv.textContent = message;

        container.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    window.downloadQRCode = function() {
        const canvas = document.getElementById('qrCanvas');
        if (!canvas) {
            afficherMessageQR('Erreur : Canvas non trouvé !', 'danger');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'qrcode-' + Date.now() + '.png';
            link.click();
            afficherMessageQR('✅ QR Code téléchargé avec succès !', 'success');
        } catch (error) {
            console.error('Error creating download link:', error);
            afficherMessageQR("Une erreur s'est produite lors du téléchargement", 'danger');
        }
    }

    window.shareQRCode = function() {
        const canvas = document.getElementById('qrCanvas');
        if (!canvas) {
            afficherMessageQR('Erreur : Canvas non trouvé !', 'danger');
            return;
        }

        canvas.toBlob(function(blob) {
            const file = new File([blob], "qrcode.png", {
                type: "image/png"
            });
            const shareData = {
                files: [file],
                title: 'Mon QR Code',
                text: 'Voici mon QR Code généré'
            };

            if (navigator.share && navigator.canShare(shareData)) {
                navigator.share(shareData)
                    .then(() => afficherMessageQR('QR Code partagé avec succès !', 'success'))
                    .catch((error) => {
                        console.error('Erreur lors du partage:', error);
                        afficherMessageQR("Erreur lors du partage du QR Code.", "danger");
                    });
            } else {
                afficherMessageQR("Le partage n'est pas pris en charge sur votre appareil ou navigateur.", "danger");
            }
        }, 'image/png');
    }
});