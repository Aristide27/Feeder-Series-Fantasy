# Fantasy Formula 2 🏎️

Projet de jeu **Fantasy Formula 2** inspiré du Fantasy F1 officiel.

L’objectif est de créer une application web simple, pédagogique et évolutive permettant aux utilisateurs de :
- choisir une écurie de F2
- sélectionner 2 pilotes
- cumuler des points selon des règles précises de qualification, sprint et course

---

## 🧠 Objectifs pédagogiques

- Apprendre le développement web **from scratch**
- Comprendre la séparation Frontend / Backend
- Manipuler une base de données SQLite
- Implémenter une logique métier (règles fantasy)
- Construire une API REST simple

---

## 🛠️ Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript (vanilla)
- **Backend** : Node.js, Express
- **Base de données** : SQLite (better-sqlite3)
- **Aucune librairie ou framework complexe**

---

## 📁 Structure du projet

---

## 🔌 API REST (résumé)

### Drivers
- `GET /api/drivers` → liste des pilotes F2
- `POST /api/drivers` → ajouter un pilote
- `DELETE /api/drivers/:id` → supprimer un pilote

### Constructors
- `GET /api/constructors` → liste des écuries F2
- `POST /api/constructors` → ajouter une écurie
- `DELETE /api/constructors/:id` → supprimer une écurie

### Users
- `POST /api/users` → créer un utilisateur

### Fantasy Teams
- `POST /api/fantasy-teams` → créer une équipe fantasy (1 écurie)
- `DELETE /api/fantasy-teams/:id` → supprimer l’équipe

### Picks (pilotes)
- `POST /api/fantasy-teams/:id/picks` → ajouter un pilote
- `DELETE /api/fantasy-teams/:id/picks/:driverId` → retirer un pilote

### Contraintes serveur
- Maximum **2 pilotes par équipe**
- Pas de doublon pilote
- Validation côté backend (frontend non fiable)
