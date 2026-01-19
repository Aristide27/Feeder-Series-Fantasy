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

module.exports = {
  calculateQualifyingDriverPoints
};
