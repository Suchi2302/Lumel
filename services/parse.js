const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../dao/Mysql');
const path = require('path');

const filePath = path.join(__dirname, '../data/sales.csv');

async function loadCSVData() {
  const products = new Map();
  const customers = new Map();
  const orders = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        products.set(row['Product ID'], {
          product_id: row['Product ID'],
          product_name: row['Product Name'],
          category: row['Category']
        });

        customers.set(row['Customer ID'], {
          customer_id: row['Customer ID'],
          name: row['Customer Name'],
          email: row['Customer Email'],
          address: row['Customer Address']
        });

        orders.push([
          row['Order ID'],
          row['Product ID'],
          row['Customer ID'],
          row['Region'],
          row['Date of Sale'],
          row['Quantity Sold'],
          row['Unit Price'],
          row['Discount'],
          row['Shipping Cost'],
          row['Payment Method']
        ]);
      })
      .on('end', async () => {
        const conn = await pool.getConnection();
        try {
          await conn.query('DELETE FROM orders');
          await conn.query('DELETE FROM products');
          await conn.query('DELETE FROM customers');

          await conn.beginTransaction();

          for (let product of products.values()) {
            await conn.query('INSERT IGNORE INTO products SET ?', product);
          }

          for (let customer of customers.values()) {
            await conn.query('INSERT IGNORE INTO customers SET ?', customer);
          }

          await conn.query(
            `INSERT IGNORE INTO orders 
              (order_id, product_id, customer_id, region, date_of_sale, quantity_sold, unit_price, discount, shipping_cost, payment_method)
             VALUES ?`,
            [orders]
          );

          await conn.commit();
          fs.appendFileSync('refresh.log', ` Data loaded at ${new Date()}\n`);
          resolve();
        } catch (err) {
          await conn.rollback();
          fs.appendFileSync('refresh.log', `Load failed at ${new Date()}: ${err.message}\n`);
          reject(err);
        } finally {
          conn.release();
        }
      });
  });
}

module.exports = { loadCSVData };
