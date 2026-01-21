const db = require('../config/database');
const logger = require('../config/logger');

class Category {
  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT c.*, COUNT(p.id) as product_count
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id
         GROUP BY c.id
         ORDER BY c.name ASC`
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      logger.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  static async create(categoryData) {
    try {
      const { name, description } = categoryData;
      const [result] = await db.query(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  static async update(id, categoryData) {
    try {
      const { name, description } = categoryData;
      const [result] = await db.query(
        'UPDATE categories SET name = ?, description = ?, updated_at = NOW() WHERE id = ?',
        [name, description, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Category;
