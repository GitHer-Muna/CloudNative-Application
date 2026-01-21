import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warehouse as WarehouseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { productsAPI, categoriesAPI, warehousesAPI } from '../services/api';

function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box sx={{ color: color, fontSize: 48 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalWarehouses: 0,
    lowStockCount: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [products, categories, warehouses, lowStock] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        warehousesAPI.getAll(),
        productsAPI.getLowStock(),
      ]);

      setStats({
        totalProducts: products.data.data.length,
        totalCategories: categories.data.data.length,
        totalWarehouses: warehouses.data.data.length,
        lowStockCount: lowStock.data.data.length,
      });

      setLowStockProducts(lowStock.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<InventoryIcon fontSize="inherit" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categories"
            value={stats.totalCategories}
            icon={<CategoryIcon fontSize="inherit" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warehouses"
            value={stats.totalWarehouses}
            icon={<WarehouseIcon fontSize="inherit" />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockCount}
            icon={<WarningIcon fontSize="inherit" />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {lowStockProducts.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Low Stock Alerts
          </Typography>
          {lowStockProducts.map((product) => (
            <Alert
              key={product.id}
              severity="warning"
              sx={{ mb: 1 }}
              icon={<WarningIcon />}
            >
              <strong>{product.name}</strong> - Current stock: {product.total_stock} (Reorder
              level: {product.reorder_level})
            </Alert>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default Dashboard;
