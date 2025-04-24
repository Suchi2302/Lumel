const express = require('express');
const router = express.Router();
const { totalRevenue, totalRevenueByCategory,totalRevenueByProduct,totalRevenueByRegion } = require('../controllers/revenueController');

const { loadCSVData } = require('../services/parse');

router.get('/revenue/total', totalRevenue);
router.get('/revenue/by-category', totalRevenueByCategory);
router.get('/revenue/by-product', totalRevenueByProduct);
router.get('/revenue/by-region', totalRevenueByRegion);


router.post('/data/refresh', async (req, res) => {
  try {
    await loadCSVData();
    res.json({ message: 'Data refreshed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh data' });
  }
});

module.exports = router;
