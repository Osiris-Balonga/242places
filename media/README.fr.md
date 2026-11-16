# Photographies des lieux

[English](README.md)

`photos.json` associe chaque photo à des UUID stables explicites, avec légendes FR/EN, auteur, source et licence. Les éventuels `relatedPlaceIds` sont des rattachements examinés, jamais une correspondance sur le seul nom ni un héritage automatique. Une photo de ville n’illustre pas arbitrairement tous ses quartiers.

Le premier lot comprend trois photographies de villes déjà publiées et huit nouvelles **candidates**, pour Bacongo, Talangaï et Poto-Poto. La couverture photographique reste partielle. Les photos de personnes sans rapport avec le lieu, captures de téléphone et vues redondantes ont été écartées.

## Validation

Le serveur normal affiche uniquement les entrées `reviewStatus: "approved"`. Pour examiner les candidates en local, définir `PLACE_PHOTO_REVIEW=1` **avant de démarrer le serveur**. Ne pas activer ce réglage en production. L’aperçu utilise les véritables photos candidates, sans badge de démonstration ni photographie générée présentée comme documentaire.

Vérifier source, rattachement géographique, légende, auteur et licence avant de passer les entrées acceptées à `approved` dans un commit relu. Retirer les photos rejetées du manifeste et du site. En l’absence de photo, afficher un visuel neutre compact, pas une photo d’un autre lieu.

## Stockage et diffusion

Le bucket Cloudflare R2 privé `242places-media` conserve les variantes optimisées sous les clés `candidates/<photo-id>/...` du manifeste. Cette modification n’active aucun accès public au bucket, domaine personnalisé ou déploiement en production. La publication des photos validées reste une étape distincte.

Pour la revue et la CI sans identifiants R2, cette branche sert les WebP versionnés depuis `/media/`. Les téléchargements originaux de recherche restent hors du dépôt. Le manifeste conserve URL source et SHA-256 pour la reproductibilité. Les variantes utilisent au maximum 384/768/1280px sans agrandissement ; les métadonnées sont retirées et aucun élément de la scène n’est modifié. La galerie plein écran conserve le cadrage intégral ; les vignettes peuvent être recadrées en CSS. Les photographies de villes existantes restent dans `/images/`.

La galerie affiche auteur, source et licence de chaque image. Les licences CC BY/CC BY-SA des photographies et de leurs variantes restent applicables, indépendamment de la licence MIT du code. Les images CC0 conservent également leur provenance.
