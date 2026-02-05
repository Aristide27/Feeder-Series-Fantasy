function pointsQualifying(position, status) {
  if (status === "DNS" || status === "DNF"|| status === "DSQ") return -20;
  switch (position) {
    case 1: return 10;
    case 2: return 9;
    case 3: return 8;
    case 4: return 7;
    case 5: return 6;
    case 6: return 5;
    case 7: return 4;
    case 8: return 3;
    case 9: return 2;
    case 10: return 1;
    default: return 0;
  }
}

function pointsSprint(position, status, fastestLap = false) {
  if (status === "DNS" || status === "DNF"|| status === "DSQ") return -20;
  let pts = 0;
  switch (position) {
    case 1: pts = 10; break;
    case 2: pts = 8; break;
    case 3: pts = 6; break;
    case 4: pts = 5; break;
    case 5: pts = 4; break;
    case 6: pts = 3; break;
    case 7: pts = 2; break;
    case 8: pts = 1; break;
  }

  if (fastestLap) pts += 5;
  return pts;
}

function pointsFeature(position, status, fastestLap = false) {
  if (status === "DNS" || status === "DNF"|| status === "DSQ") return -20;
  if (status === "CANCELLED") return 0;

  let pts = 0;
  switch (position) {
    case 1: pts = 25; break;
    case 2: pts = 18; break;
    case 3: pts = 15; break;
    case 4: pts = 12; break;
    case 5: pts = 10; break;
    case 6: pts = 8; break;
    case 7: pts = 6; break;
    case 8: pts = 4; break;
    case 9: pts = 2; break;
    case 10: pts = 1; break;
  }

  if (fastestLap) pts += 10;
  return pts;
}

module.exports = {
  pointsQualifying,
  pointsSprint,
  pointsFeature
};
