import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import productosRoutes from './src/routes/productos.js';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares globales
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://evaluacionexpress.onrender.com'] // Reemplazar con tu dominio en producción
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.use('/api/productos', productosRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Gestión de Productos',
    version: '1.0.0',
    endpoints: {
      productos: {
        'GET /api/productos': 'Listar todos los productos',
        'GET /api/productos/:id': 'Obtener un producto específico',
        'POST /api/productos': 'Crear un nuevo producto',
        'PUT /api/productos/:id': 'Actualizar un producto',
        'DELETE /api/productos/:id': 'Eliminar un producto',
        'GET /api/productos/categoria/:categoria': 'Buscar productos por categoría'
      }
    },
    parametros: {
      filtros: 'categoria, precioMin, precioMax, disponible',
      paginacion: 'page, limit'
    }
  });
});

// Ruta para obtener las categorías disponibles
app.get('/api/categorias', (req, res) => {
  const categorias = [
    'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 
    'Juguetes', 'Alimentación', 'Belleza', 'Automóvil', 'Otros'
  ];
  
  res.json({
    success: true,
    data: categorias
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableRoutes: [
      'GET /',
      'GET /api/productos',
      'GET /api/productos/:id',
      'POST /api/productos',
      'PUT /api/productos/:id',
      'DELETE /api/productos/:id',
      'GET /api/categorias'
    ]
  });
});

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;