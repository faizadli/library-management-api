const express = require('express');
const swaggerUi = require('swagger-ui-express');
// Update path sesuai struktur folder
const swaggerSpec = require('./src/routes/swagger');

const app = express();

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));