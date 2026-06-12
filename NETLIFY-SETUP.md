# Salma Jewelry — mise en ligne (TV, téléphone, Netlify)

Pour que **tout le monde** voie les mêmes articles (pas seulement ton PC) :

## 1. Déployer sur Netlify

- Dossier du site : **`salma-jewelry`** (celui qui contient `index.html` et ce fichier).
- Glisser-déposer le dossier sur [app.netlify.com](https://app.netlify.com) **ou** connecter GitHub.

## 2. Variable d’environnement (obligatoire)

Dans Netlify : **Site configuration → Environment variables**

| Clé         | Valeur (exemple)   |
|------------|---------------------|
| `ADMIN_PIN` | `Salma&Amine`       |

(même code que l’espace gestion sur le site)

Puis **Deploys → Trigger deploy → Deploy site**.

## 3. Utilisation au quotidien

1. Ouvre le site **sur l’URL Netlify** (pas seulement le fichier sur le Bureau).
2. Espace gestion (5 clics logo + code).
3. Ajoute / supprime des articles → enregistrement **automatique en ligne**.
4. Sur la **TV** : rafraîchir la page → même catalogue.

Si un message dit « vérifiez ADMIN_PIN », la variable n’est pas encore configurée sur Netlify.

## 4. Sauvegarde (optionnel)

Bouton **Exporter le catalogue** = copie `products.json` sur ton PC (secours).
