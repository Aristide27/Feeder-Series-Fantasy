const db = require("../db");

console.log("=== CRÉATION DE LA LIGUE FSF ===\n");

try {
  // 1. Vérifier si la ligue FSF existe déjà
  const existingLeague = db.prepare("SELECT * FROM leagues WHERE code = 'FSF'").get();
  
  if (existingLeague) {
    console.log("✓ La ligue FSF existe déjà (id:", existingLeague.id, ")");
  } else {
    console.log("→ Création de la ligue FSF...");
    
    // Créer un utilisateur système si nécessaire (pour être le créateur)
    let systemUser = db.prepare("SELECT id FROM users WHERE id = 1").get();
    
    if (!systemUser) {
      console.log("→ Création de l'utilisateur système...");
      const bcrypt = require("bcrypt");
      const hashedPassword = bcrypt.hashSync("system_secure_password_123", 10);
      
      db.prepare(`
        INSERT INTO users (username, email, password_hash)
        VALUES ('FSF_System', null, ?)
      `).run(hashedPassword);
      
      systemUser = { id: 1 };
      console.log("✓ Utilisateur système créé");
    }
    
    // Créer la ligue FSF
    const result = db.prepare(`
      INSERT INTO leagues (name, code, creator_id, is_official)
      VALUES ('FSF Officiel', 'FSF', ?, 1)
    `).run(systemUser.id);
    
    console.log("✓ Ligue FSF créée (id:", result.lastInsertRowid, ")");
  }
  
  // 2. Récupérer la ligue FSF
  const fsfLeague = db.prepare("SELECT * FROM leagues WHERE code = 'FSF'").get();
  
  // 3. Inscrire tous les utilisateurs existants à la ligue FSF
  console.log("\n→ Inscription des utilisateurs existants...");
  
  const users = db.prepare("SELECT id, username FROM users").all();
  let inscribed = 0;
  let alreadyMember = 0;
  
  for (const user of users) {
    // Vérifier si l'utilisateur est déjà membre
    const existing = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(fsfLeague.id, user.id);
    
    if (existing) {
      alreadyMember++;
      continue;
    }
    
    // Ajouter comme membre
    db.prepare(`
      INSERT INTO league_members (league_id, user_id)
      VALUES (?, ?)
    `).run(fsfLeague.id, user.id);
    
    // Initialiser le score
    db.prepare(`
      INSERT INTO league_scores (league_id, user_id, total_points)
      VALUES (?, ?, 0)
    `).run(fsfLeague.id, user.id);
    
    console.log(`  ✓ ${user.username} inscrit à la ligue FSF`);
    inscribed++;
  }
  
  console.log(`\n✓ ${inscribed} nouveau(x) membre(s) inscrit(s)`);
  if (alreadyMember > 0) {
    console.log(`  ${alreadyMember} membre(s) déjà inscrit(s)`);
  }
  
  // 4. Afficher le résumé
  console.log("\n=== RÉSUMÉ ===");
  const members = db.prepare(`
    SELECT COUNT(*) as count FROM league_members 
    WHERE league_id = ?
  `).get(fsfLeague.id);
  
  console.log(`✓ Ligue FSF active`);
  console.log(`✓ ${members.count} membre(s) inscrit(s)`);
  console.log(`✓ Code de la ligue : FSF`);
  console.log(`✓ Ligue officielle : Oui`);
  
  console.log("\n=== SUCCÈS ===");
  console.log("La ligue FSF est prête !");
  console.log("Le classement mondial devrait maintenant fonctionner.");
  
} catch (err) {
  console.error("\n✗ ERREUR :", err.message);
  console.error(err);
}