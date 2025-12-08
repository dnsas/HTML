<?php
// /var/www/html/php/soumettreRequete2.php
// Version qui autorise les INSERT, UPDATE, DELETE

// Configuration des erreurs
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Vérifier si c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Cette API n\'accepte que les requêtes POST'
    ]);
    exit;
}

// Définir l'en-tête JSON
header('Content-Type: application/json; charset=utf-8');

// Paramètres de connexion
$host = 'localhost';
$dbname = 'BaseEtu';
$username = 'root';
$password = 'simpsons';

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Vérifier si la requête est présente
    if (!isset($_POST['texteRequete']) || empty(trim($_POST['texteRequete']))) {
        throw new Exception("Aucune requête SQL reçue");
    }
    
    $requete = trim($_POST['texteRequete']);
    $requeteUpper = strtoupper($requete);
    
    // Sécurité : Vérifier le type de requête
    // Autoriser SELECT, INSERT, UPDATE, DELETE mais avec des validations
    $premierMot = strtok($requeteUpper, " ");
    
    $requetesAutorisees = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'SHOW', 'DESCRIBE'];
    
    if (!in_array($premierMot, $requetesAutorisees)) {
        throw new Exception("Type de requête non autorisé. Seules les requêtes SELECT, INSERT, UPDATE, DELETE sont autorisées.");
    }
    
    // Exécuter la requête
    $stmt = $pdo->query($requete);
    
    // Préparer la réponse selon le type de requête
    $response = ['success' => true];
    
    if ($premierMot === 'SELECT' || $premierMot === 'SHOW' || $premierMot === 'DESCRIBE') {
        // Pour les requêtes de sélection
        $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['type'] = 'select';
        $response['count'] = count($resultats);
        $response['data'] = $resultats;
        
        if (count($resultats) === 0) {
            $response['message'] = 'Aucun résultat trouvé';
        }
    } else {
        // Pour les requêtes de modification (INSERT, UPDATE, DELETE)
        $rowCount = $stmt->rowCount();
        $response['type'] = strtolower($premierMot);
        $response['affected_rows'] = $rowCount;
        $response['message'] = "Opération réussie. $rowCount ligne(s) affectée(s).";
        
        // Pour les INSERT, récupérer le dernier ID
        if ($premierMot === 'INSERT') {
            $response['last_insert_id'] = $pdo->lastInsertId();
        }
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    // Erreur de base de données
    $response = [
        'success' => false,
        'error' => 'Erreur de base de données',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ];
    echo json_encode($response);
    
} catch (Exception $e) {
    // Autre erreur
    $response = [
        'success' => false,
        'error' => 'Erreur de requête',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
}
?>