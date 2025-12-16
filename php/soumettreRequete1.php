<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$rawInput = file_get_contents('php://input');
error_log("Données brutes reçues: " . $rawInput);
error_log("Méthode: " . $_SERVER['REQUEST_METHOD']);
error_log("POST: " . print_r($_POST, true));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => 'Cette API n\'accepte que les requêtes POST'
    ]);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'BaseEtu';
$username = 'root';    
$password = 'simpsons'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if (!isset($_POST['texteRequete']) || empty($_POST['texteRequete'])) {
        throw new Exception("Aucune requête SQL reçue");
    }
    
    $requete = $_POST['texteRequete'];
    $requeteUpper = strtoupper(trim($requete));
    if (strpos($requeteUpper, 'SELECT') !== 0) {
        throw new Exception("Seules les requêtes SELECT sont autorisées");
    }
    
    // Exécuter la requête
    $stmt = $pdo->query($requete);
    
    $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response = [
        'success' => true,
        'count' => count($resultats),
        'data' => $resultats
    ];
    
    // Si pas de résultats, on renvoie quand même un tableau vide
    if (count($resultats) === 0) {
        $response['message'] = 'Aucun résultat trouvé';
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    $response = [
        'success' => false,
        'error' => 'Erreur de base de données',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ];
    echo json_encode($response);
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => 'Erreur de requête',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
}
?>