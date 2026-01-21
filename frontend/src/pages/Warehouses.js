import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { warehousesAPI } from '../services/api';

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState({
    name: '',
    location: '',
    capacity: '',
    manager_name: '',
    contact_email: '',
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleOpen = (warehouse = null) => {
    if (warehouse) {
      setCurrentWarehouse(warehouse);
      setEditMode(true);
    } else {
      setCurrentWarehouse({
        name: '',
        location: '',
        capacity: '',
        manager_name: '',
        contact_email: '',
      });
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentWarehouse({
      name: '',
      location: '',
      capacity: '',
      manager_name: '',
      contact_email: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await warehousesAPI.update(currentWarehouse.id, currentWarehouse);
      } else {
        await warehousesAPI.create(currentWarehouse);
      }
      handleClose();
      fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await warehousesAPI.delete(id);
        fetchWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
      }
    }
  };

  const handleChange = (e) => {
    setCurrentWarehouse({
      ...currentWarehouse,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Warehouses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Warehouse
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Total Items</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell>{warehouse.location}</TableCell>
                <TableCell>{warehouse.capacity}</TableCell>
                <TableCell>{warehouse.manager_name}</TableCell>
                <TableCell>{warehouse.contact_email}</TableCell>
                <TableCell>
                  <Chip label={warehouse.total_items} color="info" size="small" />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(warehouse)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(warehouse.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Warehouse Name"
            fullWidth
            value={currentWarehouse.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={currentWarehouse.location}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="capacity"
            label="Capacity"
            type="number"
            fullWidth
            value={currentWarehouse.capacity}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="manager_name"
            label="Manager Name"
            fullWidth
            value={currentWarehouse.manager_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="contact_email"
            label="Contact Email"
            type="email"
            fullWidth
            value={currentWarehouse.contact_email}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Warehouses;
