const pool = require("../dao/Mysql");

module.exports = {

    //Total Revenue: (For a date range)
  totalRevenue: async (req, res) => {
     const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ error: "Missing date range" });

    try {
      const [rows] = await pool.query(
        `SELECT  SUM(quantity_sold * unit_price * (1 - discount)) AS total_revenue FROM orders WHERE date_of_sale BETWEEN ? AND ?`, [start, end]
      );
      res.json({ totalRevenue: rows[0].total_revenue || 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Total Revenue by Category: (For a date range)
  totalRevenueByCategory: async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ error: "Missing start or end date" });

    try {
      const [rows] = await pool.query(`SELECT p.category,ROUND(SUM(o.quantity_sold * o.unit_price * (1 - o.discount)), 2) AS total_revenue FROM orders o JOIN products p ON o.product_id = p.product_id
      WHERE o.date_of_sale BETWEEN ? AND ? GROUP BY p.category ORDER BY total_revenue DESC`, [start, end]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Total Revenue by Product: (For a date range)
  totalRevenueByProduct: async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ error: "Missing start or end date" });

    try {
      const [rows] = await pool.query(
        `SELECT p.product_name,ROUND(SUM(o.quantity_sold * o.unit_price * (1 - o.discount)), 2) AS total_revenue FROM orders o
      JOIN products p ON o.product_id = p.product_id WHERE o.date_of_sale BETWEEN ? AND ? GROUP BY p.product_name ORDER BY total_revenue DESC `,
        [start, end]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Total Revenue by Region: (For a date range)
  totalRevenueByRegion: async (req, res) => { 
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ error: "Missing start or end date" });

    try {
      const [rows] = await pool.query(
        `SELECT o.region, ROUND(SUM(o.quantity_sold * o.unit_price * (1 - o.discount)), 2) AS total_revenue FROM orders o WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY o.region ORDER BY total_revenue DESC `,
        [start, end]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
