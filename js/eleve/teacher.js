// /js/eleve/teacher.js - Version adaptée avec spinner dans le bouton de connexion

let isAuthenticated = false;

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Fonctions pour gérer le spinner dans le bouton de connexion
function showLoginButtonSpinner() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        console.log("Spinner activé dans le bouton de connexion");
    }
}

function hideLoginButtonSpinner() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        console.log("Spinner désactivé dans le bouton de connexion");
    }
}

function checkEnter(event) {
    if (event.key === "Enter") {
        checkPassword();
    }
}

function checkPassword() {
    // Activer le spinner DANS LE BOUTON DE CONNEXION
    showLoginButtonSpinner();

    // Afficher aussi le spinner plein écran (optionnel)
    showLoadingSpinner();

    const passwordInput = document.getElementById('passwordInput').value;

    // Temps minimum d'affichage du spinner
    const tempsDebut = Date.now();
    const tempsMinimum = 1500; // 1.5 secondes minimum

    // Fonction pour masquer les spinners avec délai minimum
    function masquerSpinnersAvecDelai() {
        const tempsEcoule = Date.now() - tempsDebut;
        const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

        setTimeout(() => {
            hideLoginButtonSpinner();
            hideLoadingSpinner();
            console.log("Spinners masqués après délai");
        }, tempsRestant);
    }

    // Préparer les données pour la requête PHP
    const formData = new FormData();
    formData.append("password", passwordInput);

    // Appeler le script PHP pour vérifier le mot de passe
    fetch('/php/verifierPassword.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur HTTP ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                isAuthenticated = true;
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('container').style.display = 'block';
                afficherMessageQR("Connexion réussie !", 'success');
                initializePage();
            } else {
                afficherMessageQR(data.message || "Mot de passe incorrect. Veuillez réessayer.", 'danger');
            }
            masquerSpinnersAvecDelai();
        })
        .catch((error) => {
            afficherMessageQR("Erreur lors de la vérification du mot de passe. Veuillez réessayer.", 'danger');
            console.error("Erreur:", error);
            masquerSpinnersAvecDelai();
        });
}

function initializePage() {
    chargerClasses();
    afficherDonnees();
}

function chargerClasses() {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }

    // Afficher le spinner pendant le chargement des classes
    showLoadingSpinner();

    const tempsDebut = Date.now();
    const tempsMinimum = 1000; // 1 seconde minimum

    // Requête pour récupérer les classes distinctes
    const requeteSQL = "SELECT DISTINCT classe FROM eleves ORDER BY classe";
    const formData = new FormData();
    formData.append("texteRequete", requeteSQL);

    fetch('/php/soumettreRequete2.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const classes = data.data.map(row => row.classe);
                const selectElement = document.getElementById('classeSelect');
                selectElement.innerHTML = '<option value="">Toutes les classes</option>';
                classes.forEach((classe) => {
                    const option = document.createElement('option');
                    option.value = classe;
                    option.textContent = classe;
                    selectElement.appendChild(option);
                });
            }

            // Délai minimum avant de masquer le spinner
            const tempsEcoule = Date.now() - tempsDebut;
            const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

            setTimeout(() => {
                hideLoadingSpinner();
            }, tempsRestant);
        })
        .catch((error) => {
            console.error("Erreur lors du chargement des classes:", error);

            const tempsEcoule = Date.now() - tempsDebut;
            const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

            setTimeout(() => {
                hideLoadingSpinner();
            }, tempsRestant);
        });
}

function tronquerTexte(texte, longueurMax) {
    return texte.length > longueurMax ? texte.substring(0, longueurMax - 3) + '...' : texte;
}

function afficherDonnees() {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }

    // Afficher le spinner pendant le chargement des données
    showLoadingSpinner();

    const tempsDebut = Date.now();
    const tempsMinimum = 1000; // 1 seconde minimum

    const classeSelectionnee = document.getElementById('classeSelect').value;
    let requeteSQL = "SELECT * FROM eleves";

    if (classeSelectionnee) {
        requeteSQL += ` WHERE classe = '${classeSelectionnee}'`;
    }

    requeteSQL += " ORDER BY nom, prenom";

    const formData = new FormData();
    formData.append("texteRequete", requeteSQL);

    fetch('/php/soumettreRequete2.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                let html = '';
                let nombreEleves = 0;

                data.data.forEach((eleve) => {
                    nombreEleves++;
                    const nomTronque = tronquerTexte(eleve.nom, 15);
                    const prenomTronque = tronquerTexte(eleve.prenom, 15);
                    const classeTronquee = tronquerTexte(eleve.classe, 20);
                    const eleveId = eleve.id || eleve.nom + "_" + eleve.prenom;

                    html += `
                    <div class="eleve-card" data-eleve-id="${eleveId}">
                        <div class="eleve-card-inner">
                            <div class="eleve-card-front">
                                <h3 title="${eleve.prenom} ${eleve.nom}">${prenomTronque} ${nomTronque}</h3>
                                <p title="Classe: ${eleve.classe}">Classe: ${classeTronquee}</p>
                                <p>Date de création: ${eleve.dateCreation}</p>
                                <button onclick="retournerCarte(this)" class="view-qr-btn">Voir QR Code</button>
                                <button onclick="supprimerEleve('${eleve.nom}', '${eleve.prenom}', '${eleve.classe}')" class="delete-btn">Supprimer</button>
                            </div>
                            <div class="eleve-card-back">
                                <div id="qrcode-${eleveId}"></div>
                                <button onclick="retournerCarte(this)" class="return-btn">Retour</button>
                            </div>
                        </div>
                    </div>
                `;
                });

                document.getElementById('eleves-list').innerHTML = html;

                const nombreElevesElement = document.getElementById('nombre-eleves');
                if (nombreElevesElement) {
                    nombreElevesElement.textContent = `Nombre d'élèves : ${nombreEleves}`;
                }
            } else {
                document.getElementById('eleves-list').innerHTML = "<p>Aucun élève trouvé.</p>";
                const nombreElevesElement = document.getElementById('nombre-eleves');
                if (nombreElevesElement) {
                    nombreElevesElement.textContent = "Nombre d'élèves : 0";
                }
            }

            // Délai minimum avant de masquer le spinner
            const tempsEcoule = Date.now() - tempsDebut;
            const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

            setTimeout(() => {
                hideLoadingSpinner();
            }, tempsRestant);
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération des données:", error);
            document.getElementById('eleves-list').innerHTML = "<p>Erreur lors du chargement des données.</p>";
            const nombreElevesElement = document.getElementById('nombre-eleves');
            if (nombreElevesElement) {
                nombreElevesElement.textContent = "Nombre d'élèves : 0";
            }

            const tempsEcoule = Date.now() - tempsDebut;
            const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

            setTimeout(() => {
                hideLoadingSpinner();
            }, tempsRestant);
        });
}

function supprimerEleve(nom, prenom, classe) {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }

    const nomComplet = `${prenom} ${nom}`;
    const confirmationMessage = document.getElementById('confirmation-message');
    confirmationMessage.textContent = `Êtes-vous sûr de vouloir supprimer l'élève ${nomComplet} ?`;

    const confirmationDialog = document.getElementById('confirmation-dialog');
    confirmationDialog.style.display = 'flex';

    document.getElementById('confirm-yes').onclick = function() {
        // Afficher le spinner pendant la suppression
        showLoadingSpinner();

        const tempsDebut = Date.now();
        const tempsMinimum = 1000; // 1 seconde minimum

        // Construire la requête DELETE
        const requeteSQL = `DELETE FROM eleves WHERE nom = '${nom}' AND prenom = '${prenom}' AND classe = '${classe}'`;
        const formData = new FormData();
        formData.append("texteRequete", requeteSQL);

        fetch('/php/soumettreRequete2.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    afficherMessageQR(`L'élève ${nomComplet} a été supprimé avec succès.`, 'success');
                    afficherDonnees();
                } else {
                    afficherMessageQR(`Erreur lors de la suppression de l'élève ${nomComplet}.`, 'danger');
                }
                confirmationDialog.style.display = 'none';

                const tempsEcoule = Date.now() - tempsDebut;
                const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

                setTimeout(() => {
                    hideLoadingSpinner();
                }, tempsRestant);
            })
            .catch((error) => {
                console.error("Erreur lors de la suppression:", error);
                afficherMessageQR(`Erreur lors de la suppression de l'élève ${nomComplet}.`, 'danger');
                confirmationDialog.style.display = 'none';

                const tempsEcoule = Date.now() - tempsDebut;
                const tempsRestant = Math.max(0, tempsMinimum - tempsEcoule);

                setTimeout(() => {
                    hideLoadingSpinner();
                }, tempsRestant);
            });
    };

    document.getElementById('confirm-no').onclick = function() {
        confirmationDialog.style.display = 'none';
    };
}

function voirQRCode(nom, prenom, classe, dateCreation, eleveId) {
    const encodedNom = encodeURIComponent(nom);
    const encodedPrenom = encodeURIComponent(prenom);
    const encodedClasse = encodeURIComponent(classe);

    const qrData = `Nom: ${encodedNom}, Prenom: ${encodedPrenom}, Classe: ${encodedClasse}, Date de création : ${dateCreation}`;

    const qrcodeElement = document.getElementById(`qrcode-${eleveId}`);
    if (!qrcodeElement) return;

    qrcodeElement.innerHTML = '';

    const containerWidth = qrcodeElement.offsetWidth || 150;

    const canvas = document.createElement('canvas');
    canvas.width = containerWidth;
    canvas.height = containerWidth;
    qrcodeElement.appendChild(canvas);

    new QRious({
        element: canvas,
        value: qrData,
        size: containerWidth,
    });

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = '/css/eleve/images/logo.png';
    logo.onload = function() {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const logoSize = containerWidth * 0.3;
            const x = (canvas.width / 2) - (logoSize / 2);
            const y = (canvas.height / 2) - (logoSize / 2);
            ctx.drawImage(logo, x, y, logoSize, logoSize);
        }
    };
}

function retournerCarte(button) {
    const card = button.closest('.eleve-card');
    card.classList.toggle('flipped');

    if (card.classList.contains('flipped')) {
        const nom = card.querySelector('h3').textContent.split(' ')[1];
        const prenom = card.querySelector('h3').textContent.split(' ')[0];
        const classe = card.querySelector('p:nth-child(2)').textContent.split(': ')[1];
        const dateCreation = card.querySelector('p:nth-child(3)').textContent.split(': ')[1];
        const eleveId = card.dataset.eleveId;
        voirQRCode(nom, prenom, classe, dateCreation, eleveId);
    }
}

function retourAccueil() {
    window.location.href = 'home.html';
}

// Fonction d'affichage des messages adaptée
function afficherMessageQR(message, type) {
    const container = document.querySelector('.alert-container');
    if (!container) return;

    // Vider le contenu existant
    container.innerHTML = '';

    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type} show`;
    messageDiv.textContent = message;

    container.appendChild(messageDiv);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Fonctions d'alerte compatibilité (redirigent vers afficherMessageQR)
function showSuccessAlert(message) {
    afficherMessageQR(message, 'success');
}

function showErrorAlert(message) {
    afficherMessageQR(message, 'danger');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginOverlay').style.display = 'flex';
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
    }
}