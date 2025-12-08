<?php
// /html/eleve/php/soumettreRequete.php

// Configuration des erreurs
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Pour déboguer, on peut d'abord vérifier ce qui est reçu
$rawInput = file_get_contents('php://input');
error_log("Données brutes reçues: " . $rawInput);
error_log("Méthode: " . $_SERVER['REQUEST_METHOD']);
error_log("POST: " . print_r($_POST, true));

// Vérifier si c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => 'Cette API n\'accepte que les requêtes POST'
    ]);
    exit;
}

// Définir l'en-tête JSON
header('Content-Type: application/json; charset=utf-8');

// Paramètres de connexion - À ADAPTER !
$host = 'localhost';
$dbname = 'BaseEtu';
$username = 'root';    // ← Vérifiez si c'est le bon utilisateur
$password = 'simpsons';        // ← Vérifiez le mot de passe

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Vérifier si la requête est présente
    if (!isset($_POST['texteRequete']) || empty($_POST['texteRequete'])) {
        throw new Exception("Aucune requête SQL reçue");
    }
    
    $requete = $_POST['texteRequete'];
    
    // Pour sécurité, vous pouvez limiter aux requêtes SELECT seulement
    // (optionnel mais recommandé pour un environnement étudiant)
    $requeteUpper = strtoupper(trim($requete));
    if (strpos($requeteUpper, 'SELECT') !== 0) {
        throw new Exception("Seules les requêtes SELECT sont autorisées");
    }
    
    // Exécuter la requête
    $stmt = $pdo->query($requete);
    
    // Récupérer les résultats
    $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Préparer la réponse
    $response = [
        'success' => true,
        'count' => count($resultats),
        'data' => $resultats
    ];
    
    // Si pas de résultats, on renvoie quand même un tableau vide
    if (count($resultats) === 0) {
        // Pour les requêtes qui ne retournent pas de données (ex: SHOW TABLES)
        $response['message'] = 'Aucun résultat trouvé';
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