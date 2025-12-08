// home.monqr.js
document.addEventListener('DOMContentLoaded', function() {

    // Initialiser Firebase si nécessaire
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Fonctions d'alerte
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.classList.add('show');
        }, 100);

        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alertContainer.contains(alert)) {
                    alertContainer.removeChild(alert);
                }
            }, 300);
        }, 3000);
    }

    function showSuccessAlert(message) {
        showAlert(message, 'success');
    }

    function showErrorAlert(message) {
        showAlert(message, 'danger');
    }

    // Récupérer le formulaire
    const formulaireEleve = document.querySelector('.formulairePourBDEtudiant');

    if (formulaireEleve) {
        // Empêcher le gestionnaire par défaut de s'exécuter
        formulaireEleve.addEventListener('submit', function(evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation(); // Empêche les autres écouteurs

            console.log("Formulaire traité par home.monqr.js");

            const nom = this.querySelector('[name="nom"]').value.trim();
            const prenom = this.querySelector('[name="prenom"]').value.trim();
            const classe = this.querySelector('[name="classe"]').value.trim();

            if (!nom || !prenom || !classe) {
                showErrorAlert("Veuillez remplir tous les champs !");
                return;
            }

            document.getElementById('loading-spinner').style.display = 'flex';

            const date = new Date().toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            const qrData = `Nom: ${nom}, Prenom: ${prenom}, Classe: ${classe}, Date de création : ${date}`;

            // Générer le QR Code
            const canvas = document.getElementById('qrCanvas');
            const ctx = canvas.getContext('2d');
            const canvasSize = 300;
            canvas.width = canvasSize;
            canvas.height = canvasSize;

            const qr = new QRious({
                element: canvas,
                value: qrData,
                size: canvasSize,
                background: null,
                backgroundAlpha: 0
            });

            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = '/css/eleve/images/logo.png'; // Assurez-vous que ce chemin est correct

            logo.onload = function() {
                const logoSize = canvasSize * 0.3; // Taille plus raisonnable
                const x = (canvas.width / 2) - (logoSize / 2);
                const y = (canvas.height / 2) - (logoSize / 2);

                ctx.drawImage(logo, x, y, logoSize, logoSize);

                // Afficher le QR code
                document.querySelector('.qr_code').style.display = 'block';
                document.getElementById('downloadBtn').style.display = 'block';
                document.getElementById('shareBtn').style.display = 'block';
                document.getElementById('loading-spinner').style.display = 'none';

                showSuccessAlert("QR Code généré avec succès !");
            };

            logo.onerror = function() {
                document.getElementById('loading-spinner').style.display = 'none';
                showSuccessAlert("QR Code généré avec succès !");
            };

            // Préparer et soumettre la requête SQL via le système existant
            const sql = `INSERT INTO eleves (nom, prenom, classe, dateCreation) VALUES ('${nom}', '${prenom}', '${classe}', '${date}')`;

            // Utiliser le système existant
            let donneesDuFormulaire = new FormData();
            donneesDuFormulaire.append("texteRequete", sql);

            const optionsAjax = {
                "method": "POST",
                "body": donneesDuFormulaire
            };

            // Utiliser la même adresse que dans gestionFormulaire.js
            fetch("/php/soumettreRequete2.php", optionsAjax)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(resultats => {
                    console.log("Données enregistrées avec succès:", resultats);

                    // Si l'enregistrement a réussi, on peut afficher un message
                    if (resultats && resultats.length > 0) {
                        showSuccessAlert("Données enregistrées dans la base de données !");
                    }
                })
                .catch(erreur => {
                    console.error("Erreur lors de l'enregistrement:", erreur);
                    showErrorAlert("Erreur lors de l'enregistrement dans la base de données.");
                });
        }, true); // Utiliser capture pour s'exécuter en premier
    }

    // Gestion des boutons de téléchargement et partage
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const canvas = document.getElementById('qrCanvas');
            if (!canvas) {
                showErrorAlert('Erreur : Canvas non trouvé !');
                return;
            }

            try {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `qrcode-${Date.now()}.png`;
                link.click();
                showSuccessAlert('QR Code téléchargé avec succès !');
            } catch (error) {
                console.error('Error creating download link:', error);
                showErrorAlert("Une erreur s'est produite lors du téléchargement.");
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const canvas = document.getElementById('qrCanvas');
            if (!canvas) {
                showErrorAlert('Erreur : Canvas non trouvé !');
                return;
            }

            canvas.toBlob(function(blob) {
                const file = new File([blob], "qrcode.png", { type: "image/png" });
                const shareData = {
                    files: [file],
                    title: 'Mon QR Code',
                    text: 'Voici mon QR Code généré'
                };

                if (navigator.share && navigator.canShare(shareData)) {
                    navigator.share(shareData)
                        .then(() => showSuccessAlert('QR Code partagé avec succès !'))
                        .catch((error) => {
                            console.error('Erreur lors du partage:', error);
                            showErrorAlert("Erreur lors du partage du QR Code.");
                        });
                } else {
                    showErrorAlert("Le partage n'est pas pris en charge sur votre navigateur.");
                }
            }, 'image/png');
        });
    }
});