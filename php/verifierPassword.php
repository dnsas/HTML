<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
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
    
    if (!isset($_POST['password']) || empty(trim($_POST['password']))) {
        throw new Exception("Aucun mot de passe reçu");
    }
    
    $passwordSaisi = trim($_POST['password']);
    
    $stmt = $pdo->query("SELECT password FROM settings LIMIT 1");
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$settings) {
        throw new Exception("Aucun paramètre trouvé dans la table settings");
    }
    
    $passwordCorrect = $settings['password'];
    
    if ($passwordSaisi === $passwordCorrect) {
        $response = [
            'success' => true,
            'message' => 'Mot de passe correct'
        ];
    } else {
        $response = [
            'success' => false,
            'message' => 'Mot de passe incorrect'
        ];
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de base de données: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>