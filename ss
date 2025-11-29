<!DOCTYPE html>


<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Pokédex</title>
    <script src="js/gestionFormulaire.js" defer></script>
    <script src="js/pokemon_image.js" defer></script>
    <script src="js/pokemon-card.js" defer></script>

    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/pokemon-styles.css">
    <link rel="stylesheet" href="css/pokemon-card.css">

</head>

<body>
    <h1>Pokédex</h1>

    <!-- Formulaire pour la base de données Pokémon -->
    <form class="formulairePourBDProf">
        <label for="requete">Choisir une requête :</label>
        <select name="requete" id="requete">
            <option value="SELECT * FROM pokemons;">Tous les Pokémon</option>
            <option value="SELECT nom, type1, type2 FROM pokemons WHERE type2 IS NOT NULL;">Pokémon à double type</option>
            <option value="SELECT p.nom, t.nom AS type FROM pokemons p JOIN types t ON p.type1=t.id;">Pokémon et leur type (multi-table)</option>
            <option value="SELECT nom, evolution FROM pokemons WHERE evolution IS NOT NULL;">Pokémon évoluables</option>
        </select>
        <button type="submit">Exécuter</button>
    </form>

    <!-- Tableau de résultats -->
    <div class="affichageBD">
        <table></table>
    </div>

    <!-- Zone pour les erreurs -->
    <div class="affichageDesErreurs"></div>
</body>

</html>