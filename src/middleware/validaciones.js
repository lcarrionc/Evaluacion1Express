import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Middleware para manejar errores de validación
export const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores.array().map(error => ({
        campo: error.path,
        valor: error.value,
        mensaje: error.msg
      }))
    });
  }
  
  next();
};

// Validaciones para crear producto
export const validarCrearProducto = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre del producto es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),
    
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción del producto es obligatoria')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim()
    .escape(),
    
  body('precio')
    .notEmpty()
    .withMessage('El precio del producto es obligatorio')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número mayor a 0')
    .toFloat(),
    
  body('stock')
    .notEmpty()
    .withMessage('El stock del producto es obligatorio')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0')
    .toInt(),
    
  body('categoria')
    .notEmpty()
    .withMessage('La categoría del producto es obligatoria')
    .isIn(['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentación', 'Belleza', 'Automóvil', 'Otros'])
    .withMessage('La categoría seleccionada no es válida')
    .trim(),
    
  manejarErroresValidacion
];

// Validaciones para actualizar producto
export const validarActualizarProducto = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de producto no válido');
      }
      return true;
    }),
    
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),
    
  body('descripcion')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim()
    .escape(),
    
  body('precio')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número mayor a 0')
    .toFloat(),
    
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0')
    .toInt(),
    
  body('categoria')
    .optional()
    .isIn(['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentación', 'Belleza', 'Automóvil', 'Otros'])
    .withMessage('La categoría seleccionada no es válida')
    .trim(),
    
  manejarErroresValidacion
];

// Validación para parámetro ID
export const validarId = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de producto no válido');
      }
      return true;
    }),
    
  manejarErroresValidacion
];

// Middleware para validar que al menos un campo esté presente en actualización
export const validarCamposActualizacion = (req, res, next) => {
  const camposPermitidos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];
  const camposEnviados = Object.keys(req.body);
  
  const camposValidos = camposEnviados.filter(campo => camposPermitidos.includes(campo));
  
  if (camposValidos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar al menos un campo para actualizar',
      camposPermitidos
    });
  }
  
  next();
};