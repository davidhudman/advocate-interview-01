import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health';
import testRoutes from './routes/tests';
import debugRoutes from './routes/debug';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/health', healthRoutes);
app.use('/run-tests', testRoutes);
app.use('/debug', debugRoutes);

export default app;
