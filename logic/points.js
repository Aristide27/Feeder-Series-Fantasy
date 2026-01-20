function calculateQualifyingDriverPoints(result) {
  const { position, status } = result;

  // Cas pénalités
  if (status === "NC" || status === "DSQ") {
    return -5;
  }

  // Cas positions
  if (position === 1) return 10;
  if (position === 2) return 9;
  if (position === 3) return 8;
  if (position === 4) return 7;
  if (position === 5) return 6;
  if (position === 6) return 5;
  if (position === 7) return 4;
  if (position === 8) return 3;
  if (position === 9) return 2;
  if (position === 10) return 1;

  // 11–20
  return 0;
}

function calculateQualifyingConstructorPoints(driver1, driver2) {
  const p1 = calculateQualifyingDriverPoints(driver1);
  const p2 = calculateQualifyingDriverPoints(driver2);

  let total = p1 + p2;

  const positions = [
    driver1.position ?? 20,
    driver2.position ?? 20
  ];

  let bonusP16 = 0;
  let bonusP10 = 0;

  // Bonus/malus P16
  const p16count = positions.filter(p => p <= 16).length;
  if (p16count === 0) bonusP16 = -1;
  if (p16count === 1) bonusP16 = 1;
  if (p16count === 2) bonusP16 = 3;

  // Bonus P10 (top10)
  const top10count = positions.filter(p => p <= 10).length;
  if (top10count === 1) bonusP10 = 5;
  if (top10count === 2) bonusP10 = 10;

  let bonus = bonusP16;
  if (bonusP10 > 0) {
  bonus = bonusP10;
  }

  total += bonus;

  return total;
}

module.exports = {
  calculateQualifyingDriverPoints,
  calculateQualifyingConstructorPoints
};
