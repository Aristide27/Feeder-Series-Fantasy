let currentFantasyTeamId = null; // ID de la team côté serveur

// Affichage pilotes
async function showDrivers() {
  const res = await fetch("/api/drivers");
  const drivers = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  drivers.forEach(driver => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${driver.number} - ${driver.name} (${driver.constructor})`;
    div.onclick = () => onDriverClick(driver.id, driver.name);
    list.appendChild(div);
  });
}

// Affichage constructeurs
async function showConstructors() {
  const res = await fetch("/api/constructors");
  const constructors = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  constructors.forEach(constructor => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = constructor.name;
    div.onclick = () => onConstructorClick(constructor.id, constructor.name);
    list.appendChild(div);
  });
}

// Création d'une fantasy team en cliquant sur un constructeur
async function onConstructorClick(constructorId, constructorName) {
  if (currentFantasyTeamId) {
    alert("Équipe déjà créée !");
    return;
  }

  const res = await fetch("/api/fantasy-teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: 1, // plus tard tu brancheras le vrai user
      constructor_id: constructorId
    })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  currentFantasyTeamId = data.fantasy_team_id;
  document.querySelector("#constructor-slot span").textContent = constructorName;
  console.log("Fantasy team créée :", currentFantasyTeamId);
}

// Ajouter un pilote
async function onDriverClick(driverId, driverName) {
  if (!currentFantasyTeamId) {
    alert("Choisis une écurie d'abord !");
    return;
  }

  const res = await fetch(`/api/fantasy-teams/${currentFantasyTeamId}/picks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driver_id: driverId })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  updateTeam(driverId, driverName);
}

// Mise à jour DOM pour les pilotes
function updateTeam(driverId, driverName) {
  const slot1 = document.querySelector("#driver-slot-1 span");
  const slot2 = document.querySelector("#driver-slot-2 span");

  if (slot1.textContent === "Aucun") {
    slot1.textContent = driverName;
    document.querySelector("#driver-slot-1").dataset.driverId = driverId;
  } else if (slot2.textContent === "Aucun") {
    slot2.textContent = driverName;
    document.querySelector("#driver-slot-2").dataset.driverId = driverId;
  } else {
    alert("Déjà 2 pilotes sélectionnés");
  }
}

let teamId = 1;  // TEMPORAIRE
let currentSlot = null; // slot actif: "constructor", "driver1", "driver2"

document.querySelector("#constructor-slot").onclick = () => selectSlot("constructor");
document.querySelector("#driver-slot-1").onclick = () => selectSlot("driver1");
document.querySelector("#driver-slot-2").onclick = () => selectSlot("driver2");

function selectSlot(slot) {
  currentSlot = slot;
  if (slot === "constructor") {
    showConstructors();
  } else {
    showDrivers();
  }
}

// CLIQUE sur bouton supprimer
function removeSlot(slotId) {
  const slotDiv = document.getElementById(slotId);
  if (!slotDiv) return;

  const span = slotDiv.querySelector("span");
  if (!span) return;

  span.textContent = "Aucun";
  slotDiv.dataset.driverId = "";

  if (slotId === "constructor-slot") {
    fetch(`/api/fantasy-teams/${currentFantasyTeamId}`, { method: "DELETE" });
  } else {
    const driverId = slotDiv.dataset.driverId;
    if (driverId && currentFantasyTeamId) {
      fetch(`/api/fantasy-teams/${currentFantasyTeamId}/picks/${driverId}`, { method: "DELETE" });
    }
  }
}

// AJOUT sélection (clic sur bouton "Ajouter" d’une carte)
async function addSelection(id, name) {
  if (!currentSlot) {
    alert("Cliquez sur un emplacement de votre équipe pour ajouter");
    return;
  }

  if (currentSlot === "constructor") {
    await fetch("/api/fantasy-teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 1, constructor_id: id })
    });
    document.querySelector("#constructor-slot span").textContent = name;
  } else {
    await fetch(`/api/fantasy-teams/${teamId}/picks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: id })
    });

    const slot1 = document.querySelector("#driver-slot-1 span");
    const slot2 = document.querySelector("#driver-slot-2 span");

    if (slot1.textContent === "Aucun") {
      slot1.textContent = name;
      document.querySelector("#driver-slot-1").dataset.driverId = id;
    } else if (slot2.textContent === "Aucun") {
      slot2.textContent = name;
      document.querySelector("#driver-slot-2").dataset.driverId = id;
    }
  }

  currentSlot = null; // reset après ajout
}

// Adaptation show functions
async function showDrivers() {
  const res = await fetch("/api/drivers");
  const drivers = await res.json();
  const list = document.getElementById("list");
  list.innerHTML = "";
  drivers.forEach(driver => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${driver.number} - ${driver.name}`;
    const btn = document.createElement("button");
    btn.textContent = "Ajouter";
    btn.onclick = () => addSelection(driver.id, driver.name);
    div.appendChild(btn);
    list.appendChild(div);
  });
}

async function showConstructors() {
  const res = await fetch("/api/constructors");
  const constructors = await res.json();
  const list = document.getElementById("list");
  list.innerHTML = "";
  constructors.forEach(constructor => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = constructor.name;
    const btn = document.createElement("button");
    btn.textContent = "Ajouter";
    btn.onclick = () => addSelection(constructor.id, constructor.name);
    div.appendChild(btn);
    list.appendChild(div);
  });
}
