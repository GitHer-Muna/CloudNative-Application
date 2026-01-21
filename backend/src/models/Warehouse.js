const db = require('../config/database');
const logger = require('../config/logger');

class Warehouse {
  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT w.*, COUNT(DISTINCT pi.product_id) as product_count,
                COALESCE(SUM(pi.quantity), 0) as total_items
         FROM warehouses w
         LEFT JOIN product_inventory pi ON w.id = pi.warehouse_id
         GROUP BY w.id
         ORDER BY w.name ASC`
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM warehouses WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      logger.error(`Error fetching warehouse ${id}:`, error);
      throw error;
    }
  }

  static async create(warehouseData) {
    try {
      const { name, location, capacity, manager_name, contact_email } = warehouseData;
      const [result] = await db.query(
        `INSERT INTO warehouses (name, location, capacity, manager_name, contact_email)
         VALUES (?, ?, ?, ?, ?)`,
        [name, location, capacity, manager_name, contact_email]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating warehouse:', error);
      throw error;
    }
  }

  static async update(id, warehouseData) {
    try {
      const { name, location, capacity, manager_name, contact_email } = warehouseData;
      const [result] = await db.query(
        `UPDATE warehouses 
         SET name = ?, location = ?, capacity = ?, manager_name = ?, contact_email = ?, updated_at = NOW()
         WHERE id = ?`,
        [name, location, capacity, manager_name, contact_email, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating warehouse ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM warehouses WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error deleting warehouse ${id}:`, error);
      throw error;
    }
  }

  static async getInventory(id) {
    try {
      const [rows] = await db.query(
        `SELECT pi.*, p.name as product_name, p.sku, p.unit_price
         FROM product_inventory pi
         JOIN products p ON pi.product_id = p.id
         WHERE pi.warehouse_id = ?
         ORDER BY p.name ASC`,
        [id]
      );
      return rows;
    } catch (error) {
      logger.error(`Error fetching warehouse ${id} inventory:`, error);
      throw error;
    }
  }
}

module.exports = Warehouse;
