import swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Summary API',
      version: '1.0.0',
      description: 'API para resumir arquivos .docx e .txt usando Gemini',
    },
    servers: [
      { url: 'http://localhost:3000/api' }
    ],
  },
  apis: ['./routes/*.ts'], // Updated to look for TypeScript files
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
