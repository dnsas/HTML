<?php

 try {  // Tentative de connexion
        $db = new PDO("mysql:dbname=NOMBDD;host=localhost", "root", "simpsons");
    } 
    catch(PDOException $e)      // Si la connexion ne fonctionne pas ...
    {
        $db = null;
        echo 'La connexion a échoué :-( : ' . $e->getMessage();
    }

    $db->query("SET NAMES utf8");
    
    // Préparation et soumission d'une requête à résultat multiple</h2>
    $texteRequete = $_POST['texteRequete'] ;

    $requete = $db->prepare($texteRequete);
         
    $requete->execute() ;         
    $personnes = $requete->fetchAll(PDO::FETCH_OBJ) ;

    $resultat_json = json_encode($personnes);
	header("Access-Control-Allow-Origin: *");
	header('Content-type: application/json; charset=UTF-8');    

?>
<?=$resultat_json?> 
