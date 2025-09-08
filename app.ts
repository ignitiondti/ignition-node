import dotenv from 'dotenv';
import express, { Express } from 'express';
import fileUpload from 'express-fileupload';
import routes from './routes/index.ts';
import { swaggerUi, specs } from './config/swagger.ts';

dotenv.config();
const app: Express = express();
app.use(express.json());
app.use(fileUpload());
app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const PORT: number = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
