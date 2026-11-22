# Paramètres de l’espace de travail — spécification

> Exemple indépendant DiagramPreview. À adapter au produit ; ce n’est pas un format officiel Figma.

## Objectif et périmètre
Permettre au propriétaire de modifier le nom et la préférence de notification.
Exclure facturation, invitations et gestion des permissions.
Utiliser des données fictives sans connexion à la production.

## Variables de conception
- Action principale : #1D4ED8 avec texte blanc.
- Texte : #0F172A sur #FFFFFF ; secondaire : #475569 ; erreur : #B91C1C.
- Police : system-ui ; corps 16px / 24px ; titre 24px / 32px.
- Espacements : 4, 8, 12, 16, 24, 32px ; rayon de carte : 8px.
- Employer des variables nommées plutôt que des couleurs ou espacements arbitraires.

## Composants et états
### Bouton Enregistrer
- Normal : « Enregistrer les modifications », fond principal.
- Survol : #1E40AF avec texte blanc lisible.
- Focus : contour visible de 2px, décalé de 2px.
- Désactivé sans changement ou si invalide ; expliquer les erreurs près des champs.
- Pendant l’enregistrement, afficher un message et empêcher les envois multiples.
- Succès : annoncer « Modifications enregistrées » dans une région dynamique.
- En cas d’erreur, conserver les saisies et proposer de réessayer.
### Nom de l’espace de travail
- Obligatoire, de 2 à 60 caractères après suppression des espaces externes.
- Libellé et aide visibles ; l’indication de saisie ne remplace pas le libellé.
- Valider à la perte du focus et avant enregistrement ; associer l’erreur au champ.
- Ne rien enregistrer si les données sont invalides.

## Interactions et données
1. Charger le nom et la préférence actuels.
2. Activer Enregistrer uniquement pour des valeurs modifiées et valides.
3. Simuler la requête et présenter l’état de chargement.
4. En cas de succès, conserver les valeurs confirmées et annoncer la fin.
5. En cas d’échec, conserver le brouillon et permettre de réessayer.
- Chargement initial : afficher un indicateur accompagné de texte.
- Échec initial : proposer de réessayer sans inventer les données enregistrées.
- Si le nom est vide, afficher le message de champ obligatoire.

## Affichage adaptatif
- Sous 768px : une colonne, marge de 16px et bouton pleine largeur.
- À partir de 768px : formulaire centré, largeur maximale 640px, marge de 24px.
- À 320px de largeur : aucun défilement horizontal.

## Accessibilité
- Chaque champ possède un libellé programmatique ; Tab suit l’ordre visuel.
- Utilisation au clavier avec focus visible sur toutes les commandes.
- Expliquer succès et erreurs par du texte, pas uniquement par la couleur.
- Vérifier un contraste minimal de 4.5:1 sur le fond réel pour le texte normal.

## Liste de validation
- [ ] Pour un nom vide, afficher une erreur et empêcher l’envoi.
- [ ] Hors de la plage 2–60 caractères, afficher une erreur précise.
- [ ] Pendant l’enregistrement, les clics répétés produisent une seule requête.
- [ ] En cas d’erreur, conserver les saisies et permettre de réessayer.
- [ ] Annoncer le succès sans déplacer le focus.
- [ ] Tester le clavier et la largeur de 320px.
- [ ] Comparer chaque état implémenté à cette spécification.

## Décisions avant production
- TODO : confirmer l’API, les autorisations et les réponses d’erreur avec le développement.
- TODO : confirmer les notifications et les textes avec le responsable produit.
- Remplacer les requêtes simulées après validation du contrat de données.
