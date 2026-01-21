const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Warehouse = require('../models/Warehouse');

const validateWarehouse = [
  body('name').trim().notEmpty().withMessage('Warehouse name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity').isInt({ min: 0 }).withMessage('Capacity must be a positive integer'),
  body('contact_email').isEmail().withMessage('Valid email is required')
];

router.get('/', async (req, res) => {
  try {
    const warehouses = await Warehouse.getAll();
    res.json({ success: true, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.getById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, error: 'Warehouse not found' });
    }
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/inventory', async (req, res) => {
  try {
    const inventory = await Warehouse.getInventory(req.params.id);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', validateWarehouse, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const warehouseId = await Warehouse.create(req.body);
    const warehouse = await Warehouse.getById(warehouseId);
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', validateWarehouse, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const updated = await Warehouse.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Warehouse not found' });
    }

    const warehouse = await Warehouse.getById(req.params.id);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Warehouse.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Warehouse not found' });
    }
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
