import express from 'express';
import Producto from '../models/Producto.js';
import { 
  validarCrearProducto, 
  validarActualizarProducto, 
  validarId,
  validarCamposActualizacion 
} from '../middleware/validaciones.js';

const router = express.Router();

// GET /productos - Listar todos los productos
router.get('/', async (req, res) => {
  try {
    const { categoria, precioMin, precioMax, disponible, page = 1, limit = 10 } = req.query;
    
    // Construir filtros de búsqueda
    const filtros = {};
    
    if (categoria) {
      filtros.categoria = categoria;
    }
    
    if (precioMin || precioMax) {
      filtros.precio = {};
      if (precioMin) filtros.precio.$gte = parseFloat(precioMin);
      if (precioMax) filtros.precio.$lte = parseFloat(precioMax);
    }
    
    if (disponible === 'true') {
      filtros.stock = { $gt: 0 };
    } else if (disponible === 'false') {
      filtros.stock = 0;
    }
    
    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Ejecutar consulta con paginación
    const productos = await Producto.find(filtros)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await Producto.countDocuments(filtros);
    const totalPaginas = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: productos,
      pagination: {
        paginaActual: parseInt(page),
        totalPaginas,
        totalProductos: total,
        productosEnPagina: productos.length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
      error: error.message
    });
  }
});

// GET /productos/:id - Obtener un producto específico
router.get('/:id', validarId, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: producto
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
});

// POST /productos - Crear un nuevo producto
router.post('/', validarCrearProducto, async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    
    // Verificar si ya existe un producto con el mismo nombre
    const productoExistente = await Producto.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } 
    });
    
    if (productoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con ese nombre'
      });
    }
    
    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock,
      categoria
    });
    
    const productoGuardado = await nuevoProducto.save();
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: productoGuardado
    });
    
  } catch (error) {
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errores
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message
    });
  }
});

// PUT /productos/:id - Actualizar un producto
router.put('/:id', validarActualizarProducto, validarCamposActualizacion, async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;
    
    // Verificar si el producto existe
    const productoExistente = await Producto.findById(id);
    if (!productoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (actualizaciones.nombre) {
      const productoConMismoNombre = await Producto.findOne({
        _id: { $ne: id },
        nombre: { $regex: new RegExp(`^${actualizaciones.nombre}$`, 'i') }
      });
      
      if (productoConMismoNombre) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro producto con ese nombre'
        });
      }
    }
    
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      actualizaciones,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errores
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
});

// DELETE /productos/:id - Eliminar un producto
router.delete('/:id', validarId, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: producto
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
});

// Ruta adicional: GET /productos/categoria/:categoria
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const productos = await Producto.buscarPorCategoria(categoria);
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos por categoría',
      error: error.message
    });
  }
});

export default router;