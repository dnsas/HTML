<?php
header("Access-Control-Allow-Origin: *");
header('Content-type: application/json; charset=UTF-8');

// Récupérer la requête SQL
$texteRequete = $_POST['texteRequete'] ?? '';

try {
    // Connexion à la base de données
    $db = new PDO("mysql:dbname=formulairePourBDEtudiant;host=localhost", "root", "simpsons");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->query("SET NAMES utf8");
    
    // Exécuter la requête
    $requete = $db->prepare($texteRequete);
    $requete->execute();
    
    // Si c'est une requête INSERT, UPDATE ou DELETE
    if (stripos($texteRequete, 'INSERT') === 0 || 
        stripos($texteRequete, 'UPDATE') === 0 || 
        stripos($texteRequete, 'DELETE') === 0) {
        
        // Pour INSERT, récupérer le dernier ID inséré
        if (stripos($texteRequete, 'INSERT') === 0) {
            $lastId = $db->lastInsertId();
            // Récupérer l'enregistrement inséré
            $requeteSelect = $db->prepare("SELECT * FROM eleves WHERE id = ?");
            $requeteSelect->execute([$lastId]);
            $resultats = $requeteSelect->fetchAll(PDO::FETCH_OBJ);
        } else {
            // Pour UPDATE/DELETE, retourner le nombre de lignes affectées
            $resultats = [['rows_affected' => $requete->rowCount()]];
        }
    } else {
        // Pour SELECT, récupérer les résultats
        $resultats = $requete->fetchAll(PDO::FETCH_OBJ);
    }
    
    echo json_encode($resultats);
    
} catch(PDOException $e) {
    // En cas d'erreur
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erreur de base de données : ' . $e->getMessage()
    ]);
}
?>