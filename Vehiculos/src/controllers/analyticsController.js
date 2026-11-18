const fs = require('fs');
const path = require('path');

// Función auxiliar para leer formato JSON Lines generado por Apache Spark
const leerJsonLines = (ruta) => {
  const contenido = fs.readFileSync(ruta, 'utf8');
  return contenido
    .split('\n')
    .map(linea => linea.trim())
    .filter(linea => linea.length > 0)
    .map(linea => JSON.parse(linea));
};

const obtenerReporteSpark = (req, res) => {
  try {
    const dirDatos = process.env.RUTA_REPORTE_SPARK || path.join(__dirname, '../../data');

    const rutaAnios = path.join(dirDatos, 'reporte_anios.json');
    const rutaCategorias = path.join(dirDatos, 'reporte_categorias.json');
    const rutaMarcas = path.join(dirDatos, 'reporte_marcas.json');

    if (!fs.existsSync(rutaAnios) || !fs.existsSync(rutaCategorias) || !fs.existsSync(rutaMarcas)) {
      return res.status(404).json({ mensaje: 'Faltan archivos de reporte generados por Spark en /data.' });
    }

    const anios = leerJsonLines(rutaAnios);
    const categorias = leerJsonLines(rutaCategorias);
    const marcas = leerJsonLines(rutaMarcas);

    // Calcular KPIs generales a partir de los datos reales de Spark
    const totalVehiculos = categorias.reduce((acc, item) => acc + item.cantidad, 0);
    const sumaPonderadaPrecio = categorias.reduce((acc, item) => acc + (item.precio_promedio * item.cantidad), 0);
    const sumaPonderadaKm = categorias.reduce((acc, item) => acc + (item.km_promedio * item.cantidad), 0);

    res.json({
      resumen_general: {
        total_vehiculos_analizados: totalVehiculos,
        precio_promedio_global: Number((sumaPonderadaPrecio / totalVehiculos).toFixed(2)),
        kilometraje_promedio: Math.round(sumaPonderadaKm / totalVehiculos)
      },
      precio_promedio_por_marca: marcas,
      distribucion_categorias: categorias,
      tendencia_por_anio: anios
    });
  } catch (error) {
    console.error('Error leyendo reportes de Spark:', error);
    res.status(500).json({ mensaje: 'Error interno al procesar los datos analíticos.' });
  }
};

module.exports = { obtenerReporteSpark };