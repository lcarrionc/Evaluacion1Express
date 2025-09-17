import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del producto es obligatoria'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio del producto es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
    validate: {
      validator: function(valor) {
        return valor > 0;
      },
      message: 'El precio debe ser mayor a 0'
    }
  },
  stock: {
    type: Number,
    required: [true, 'El stock del producto es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un número entero'
    }
  },
  categoria: {
    type: String,
    required: [true, 'La categoría del producto es obligatoria'],
    enum: {
      values: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentación', 'Belleza', 'Automóvil', 'Otros'],
      message: 'La categoría seleccionada no es válida'
    }
  }
}, {
  timestamps: false, // Agrega createdAt y updatedAt automáticamente
  versionKey: false // Quita el campo __v
});

// Índices para mejorar las consultas
productoSchema.index({ nombre: 1 });
productoSchema.index({ categoria: 1 });
productoSchema.index({ precio: 1 });

// Middleware pre-save para formatear datos
productoSchema.pre('save', function(next) {
  // Capitalizar primera letra del nombre
  this.nombre = this.nombre.charAt(0).toUpperCase() + this.nombre.slice(1).toLowerCase();
  
  // Redondear precio a 2 decimales
  this.precio = Math.round(this.precio * 100) / 100;
  
  next();
});

// Método virtual para obtener información resumida
productoSchema.virtual('resumen').get(function() {
  return {
    id: this._id,
    nombre: this.nombre,
    precio: this.precio,
    stock: this.stock,
    disponible: this.stock > 0
  };
});

// Método estático para buscar por categoría
productoSchema.statics.buscarPorCategoria = function(categoria) {
  return this.find({ categoria });
};

// Método de instancia para verificar disponibilidad
productoSchema.methods.estaDisponible = function() {
  return this.stock > 0;
};

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;