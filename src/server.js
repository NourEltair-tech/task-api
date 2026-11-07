import express from 'express';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { readFileSync } from 'node:fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const openApiText = readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8');
const openApiSpec = YAML.parse(openApiText);
app.get('/openapi.yaml', (req, res) => {
  res.type('application/yaml').send(openApiText);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/tasks', adminRoutes);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(err.stack);
  }
  if (!err.status) {
    err.status = 500;
    err.message = 'Internal Server Error';
  }
  res.status(err.status).json({ errors: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

export default app;
