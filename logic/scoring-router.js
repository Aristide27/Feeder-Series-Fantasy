const express = require('express');
const router = express.Router();
const { 
  getQualifyingPoints, 
  getSprintPoints, 
  getFeaturePoints, 
  getConstructorPoints 
} = require('../logic/scoring');
const VALID_TYPES = ['qualifying', 'sprint', 'feature'];
router.get('/scoring/:type/:weekend', async (req, res) => {
  const { type, weekend } = req.params;
  const weekendId = Number(weekend);
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be qualifying, sprint, or feature.' });
  }
  if (isNaN(weekendId)) {
    return res.status(400).json({ error: 'Invalid weekend ID.' });
  }
  try {
    let driverSeasonPoints = [];
    switch (type) {
      case 'qualifying':
        driverSeasonPoints = await getQualifyingPoints(weekendId);
        break;
      case 'sprint':
        driverSeasonPoints = await getSprintPoints(weekendId);
        break;
      case 'feature':
        driverSeasonPoints = await getFeaturePoints(weekendId);
        break;
    }
    const constructorPoints = await getConstructorPoints(weekendId);
    res.json({
      weekendId,
      type,
      driverSeasonPoints,
      constructorPoints
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;