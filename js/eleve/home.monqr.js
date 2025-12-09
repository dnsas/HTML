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
        const logoSize = canvasSize * 0.3;
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
}