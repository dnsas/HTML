// AJOUTER CES LIGNES au début, après "document.addEventListener('DOMContentLoaded', function() {"

// Écouter l'événement personnalisé pour générer le QR Code
document.addEventListener('genererQRCode', function(evt) {
    console.log("Événement genererQRCode reçu", evt.detail);

    const { nom, prenom, classe, date, insertionReussie } = evt.detail;

    // Générer le QR Code
    genererQRCode(nom, prenom, classe, date, insertionReussie);
});

// AJOUTER CETTE FONCTION après l'écouteur d'événement :

// Fonction pour générer le QR Code
function genererQRCode(nom, prenom, classe, date, insertionReussie) {
    console.log("Génération du QR Code...");

    // Afficher le spinner
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }

    const qrData = `Nom: ${nom}, Prenom: ${prenom}, Classe: ${classe}, Date de création : ${date}`;

    // Générer le QR Code
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) {
        console.error("Canvas QR non trouvé");
        if (spinner) spinner.style.display = 'none';
        return;
    }

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
    logo.src = '/css/eleve/images/logo.png';

    logo.onload = function() {
        const logoSize = canvasSize * 1.5;
        const x = (canvas.width / 2) - (logoSize / 2);
        const y = (canvas.height / 2) - (logoSize / 2);

        ctx.drawImage(logo, x, y, logoSize, logoSize);

        // Afficher le QR code
        const qrContainer = document.querySelector('.qr_code');
        if (qrContainer) {
            qrContainer.style.display = 'block';
        }

        const downloadBtn = document.getElementById('downloadBtn');
        const shareBtn = document.getElementById('shareBtn');

        if (downloadBtn) downloadBtn.style.display = 'block';
        if (shareBtn) shareBtn.style.display = 'block';

        // Cacher le spinner
        if (spinner) {
            spinner.style.display = 'none';
        }

        console.log("QR Code généré avec succès");
    };

    logo.onerror = function() {
        console.warn("Logo non chargé, affichage du QR Code sans logo");

        // Afficher le QR code sans logo
        const qrContainer = document.querySelector('.qr_code');
        if (qrContainer) {
            qrContainer.style.display = 'block';
        }

        const downloadBtn = document.getElementById('downloadBtn');
        const shareBtn = document.getElementById('shareBtn');

        if (downloadBtn) downloadBtn.style.display = 'block';
        if (shareBtn) shareBtn.style.display = 'block';

        // Cacher le spinner
        if (spinner) {
            spinner.style.display = 'none';
        }
    };




    function downloadQRCode() {
        const canvas = document.getElementById('qrCanvas');
        if (!canvas) {
            showErrorAlert('Erreur : Canvas non trouvé !');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'qrcode.png';
            link.click();
            showSuccessAlert('QR Code téléchargé avec succès !');
        } catch (error) {
            console.error('Error creating download link:', error);
            showErrorAlert("Une erreur s'est produite lors du téléchargement. Veuillez réessayer.");
        }
    }

    function shareQRCode() {
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
                showErrorAlert("Le partage n'est pas pris en charge sur votre appareil ou navigateur.");
            }
        }, 'image/png');
    }


}