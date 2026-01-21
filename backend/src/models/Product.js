const db = require('../config/database');
const logger = require('../config/logger');

class Product {
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, c.name as category_name, 
               COALESCE(SUM(pi.quantity), 0) as total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_inventory pi ON p.id = pi.product_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.category_id) {
        query += ' AND p.category_id = ?';
        params.push(filters.category_id);
      }

      if (filters.search) {
        query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' GROUP BY p.id ORDER BY p.created_at DESC';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      logger.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  static async create(productData) {
    try {
      const { name, description, sku, category_id, unit_price, reorder_level } = productData;
      const [result] = await db.query(
        `INSERT INTO products (name, description, sku, category_id, unit_price, reorder_level)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, sku, category_id, unit_price, reorder_level]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const { name, description, sku, category_id, unit_price, reorder_level } = productData;
      const [result] = await db.query(
        `UPDATE products 
         SET name = ?, description = ?, sku = ?, category_id = ?, 
             unit_price = ?, reorder_level = ?, updated_at = NOW()
         WHERE id = ?`,
        [name, description, sku, category_id, unit_price, reorder_level, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  static async getInventoryByWarehouse(productId) {
    try {
      const [rows] = await db.query(
        `SELECT pi.*, w.name as warehouse_name, w.location
         FROM product_inventory pi
         JOIN warehouses w ON pi.warehouse_id = w.id
         WHERE pi.product_id = ?`,
        [productId]
      );
      return rows;
    } catch (error) {
      logger.error(`Error fetching inventory for product ${productId}:`, error);
      throw error;
    }
  }

  static async updateInventory(productId, warehouseId, quantity) {
    try {
      const [result] = await db.query(
        `INSERT INTO product_inventory (product_id, warehouse_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = ?, updated_at = NOW()`,
        [productId, warehouseId, quantity, quantity]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating inventory:', error);
      throw error;
    }
  }

  static async getLowStockProducts(threshold = null) {
    try {
      const query = `
        SELECT p.*, COALESCE(SUM(pi.quantity), 0) as total_stock
        FROM products p
        LEFT JOIN product_inventory pi ON p.id = pi.product_id
        GROUP BY p.id
        HAVING total_stock <= COALESCE(?, p.reorder_level)
        ORDER BY total_stock ASC
      `;
      const [rows] = await db.query(query, [threshold]);
      return rows;
    } catch (error) {
      logger.error('Error fetching low stock products:', error);
      throw error;
    }
  }
}

module.exports = Product;
