# Templates e-mail Drive Lady

Deux gabarits HTML à coller dans le module **Email** du scénario Make, en mode
`HTML content`. Ils correspondent aux deux formes de soumission produites par
`app/api/contact/route.js`.

| Fichier | Formulaire concerné | Valeur de `formulaire` |
|---|---|---|
| `contact.html` | `/contact/` | `contact` |
| `partenaire.html` | `/contact-partenaires/` et `/devenir-partenaire/` | `contact-partenaires`, `devenir-partenaire` |

## Aiguiller les deux dans Make

Le webhook reçoit les deux types sur la même route. Ajoute un **Router** après le
module Webhooks, avec un filtre sur `formulaire` :

- Route 1 → `formulaire` **equal to** `contact` → module Email avec `contact.html`
- Route 2 → `formulaire` **contains** `partenaire` → module Email avec `partenaire.html`

## Remplacer les placeholders

Les `{{...}}` sont des repères de lecture, **pas** une syntaxe Make. Dans le
module Email, remplace chaque `{{cle}}` en cliquant sur la variable
correspondante du webhook. Les clés reprennent exactement le payload à plat :

**Communes aux deux templates**
`email`, `message`, `formulaire`, `full_source`, `source`, `recaptcha_score`, `receivedAt`

**`contact.html`**
`nom`, `sujet`

**`partenaire.html`**
`lieu`, `type`, `ville`

Objet de l'e-mail suggéré :

- contact → `[Drive Lady] {{sujet}} — {{nom}}`
- partenaire → `[Drive Lady] Demande partenaire — {{lieu}}`

## Le cas du champ `ville`

`ville` n'existe que sur `/contact-partenaires/`. Sur `/devenir-partenaire/` la
valeur remontera vide et la ligne s'affichera sans contenu. Deux options :

- laisser tel quel, la ligne reste discrète ;
- ou séparer les deux formulaires en deux routes Make distinctes et supprimer le
  bloc `<tr>` commenté `Ligne "Ville"` dans la copie destinée à
  `/devenir-partenaire/`.

## Contraintes respectées

- Tableaux et styles inline uniquement — pas de flex, pas de grid, pas de CSS externe.
- Largeur fixe 600 px, avec media query de repli sur mobile (les libellés passent
  au-dessus des valeurs).
- Polices web-safe : Arial est métriquement compatible avec Arimo, la police du site.
- Une seule image : le logo, servi depuis
  `https://www.drivelady.fr/assets/drive-lady-logo.png`. Son fond est exactement
  le prune du bandeau (`#8e4b6d`), il s'y fond sans bord visible. L'attribut `alt`
  affiche « Drive Lady » en blanc si le client mail bloque les images.
  Si le domaine change, c'est la seule URL à mettre à jour dans les deux fichiers.
- Bouton « Répondre » construit en tableau, cliquable dans Outlook.
- Texte de pré-en-tête masqué, repris dans l'aperçu de la boîte de réception.

## Prévisualiser

Ouvre simplement les fichiers dans un navigateur : les `{{...}}` s'affichent
tels quels, la mise en page est identique au rendu final.
