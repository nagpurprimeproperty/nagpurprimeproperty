import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nagpur Property API',
      version: '1.0.0'
    }
  },
  apis: []
});

export default swaggerSpec;
