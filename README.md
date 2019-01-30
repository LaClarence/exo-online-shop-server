# Le Reacteur - BE 03 - Exo serveur Boutique en ligne

Goal: Using object references with mongoose & mongodb

## Prerequisites

- npm must be available.
- node.js must be installed.
- mongodb installed (see exo-drugs-stock-server)

## Quick Start

```bash
npm install express body-parser mongoose

```

## Models

Pour cela, vous aurez besoin de plusieurs collections :

- Department (familles de categories)
- Category (categories de produits)
- Product (produits)

### La collection Department devra avoir pour attributs :

- title (texte)

### La collection Category devra avoir pour attributs :

- title (texte)
- description (texte)
- department (référence vers Department)

### La collection Product devra avoir pour attributs :

- title (texte)
- description (texte)
- price (nombre)
- category (référence vers Category)

## Routes

Vous devrez créer des CRUD pour chacune des collections.

### Collection: **Department**

#### Create

- **POST** http://localhost:3000/department/create
- Paramètres Body :
  - title

Exemple: Electronics, Home and Kitchen, Fashion, etc.

#### Read

- **GET** http://localhost:3000/department

Cette route devra récupérer les attributs de tous les départements.

#### Update

- **POST** http://localhost:3000/department/update
- Paramètres Query :
  - id (identifiant de l'élément à modifier)
- Paramètres Body :
  - title (nouveau titre)

#### Delete

- **POST** http://localhost:3000/department/delete
- Paramètres Query :
  - id (identifiant de l'élément à supprimer)

### Collection: **Category**

#### Create

- POST http://localhost:3000/category/create
- Paramètres Body :
  - title
  - description
  - department (identifiant de la famille de categories attribuée)

#### Read

- GET http://localhost:3000/category

Cette route devra récupérer les attributs de toutes les categories ainsi que les attributs de leurs familles de categories.

#### Update

- POST http://localhost:3000/category/update
- Paramètres Query :
  - id (identifiant de l'élément à modifier)
- Paramètres Body :
  - title (nouveau titre)
  - description (nouvelle description)
  - department (identifiant de la nouvelle famille de categories attribuée)

#### Delete

- POST http://localhost:3000/category/delete
- Paramètres Query :
  - id (identifiant de l'élément à supprimer)

### Collection: **Product**

#### Create

- **POST** http://localhost:3000/product/create
- Paramètres Body :
  - title
  - description
  - price
  - category (identifiant de la categorie attribuée)

####Read

Cette route devra récupérer des produits. Les critères suivants sont tous optionnels et peuvent être combinés afin de filtrer et trier la liste de résultats.

- **GET** http://localhost:3000/product
- Paramètres Query :
  - category (identifiant pour afficher les produits d'une catégorie en particulier)
  - title (titre du produit recherché). Si nous recherchons playstation, les produits PlayStation 3 et PlayStation 4 devront être trouvés.
  - priceMin (prix minimum). La liste de produits ne devra pas contenir de produits avec des prix inférieurs à cette valeur)
  - priceMax (prix maximum). La liste de produits ne devra pas contenir de produits avec des prix supérieurs à cette valeur)
  - sort ("price-asc" ou "price-desc"). La liste pourra être triée par prix (croissant ou décroissant)

Exemples :

Pour obtenir tous les produits :
http://localhost:3000/product

Pour obtenir tous les produits ayant un prix supérieur ou égal à 100 €.
Mots clés Google qui pourraient vous aider "mongoose greater than"
http://localhost:3000/product?priceMin=100

Pour obtenir tous les produits ayant un prix inférieur ou égal à 500 € et faisant partie de la catégorie 5c514a244d4cfe2431bb3e71.
http://localhost:3000/product?priceMax=500&category=5c514a244d4cfe2431bb3e71

Pour obtenir tous les produits triés par prix croissant et ayant un nom contenant playstation (insensible à la casse).
Mots clés Google qui pourraient vous aider "mongoose sort"
http://localhost:3000/product?sort=price-asc&title=playstation

Aide :

```JavaScript
const search = Post.find().populate("author");
if (req.query.sort === "title-asc") {
search.sort({ title: 1 });
}
const posts = await search;
res.json(posts);

```
