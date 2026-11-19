const express = require('express');
const vehiculoController = require('./controllers/vehiculoController');
const { obtenerReporteSpark } = require('./controllers/analyticsController');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Endpoints de analítica Spark (directo en :3005 y vía HAProxy /api)
app.get(['/vehiculos/analytics', '/api/vehiculos/analytics'], obtenerReporteSpark);

app.use(vehiculoController);

app.listen(3005, () => {
  console.log('Servidor ejecutandose en el puerto 3005');
});
