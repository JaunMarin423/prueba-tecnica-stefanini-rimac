const express = require('express');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

// Cargar el archivo YAML
const swaggerDocument = YAML.load('./swagger-enhanced.yaml');

const app = express();
const PORT = 3001;

// Configuración de CORS
app.use(cors());

// Servir archivos estáticos desde la raíz
app.use(express.static('.'));

// Ruta para servir el archivo YAML
app.get('/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-enhanced.yaml'));
});

// Configuración de Swagger UI
const options = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Star Wars + Clima - Documentación"
};

// Ruta para la documentación interactiva
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// Redirigir la raíz a la documentación
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de documentación ejecutándose en http://localhost:${PORT}`);
  console.log(`Documentación interactiva disponible en http://localhost:${PORT}/api-docs`);
  console.log(`Archivo YAML disponible en http://localhost:${PORT}/swagger.yaml`);
});
