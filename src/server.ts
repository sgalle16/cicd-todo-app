import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { version } from '../package.json';

// Import routes
import taskRoutes from './routes/task.routes';

const app: Express = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (adjust in production)
app.use(express.json()); // Parse JSON request bodies

// --- Static Files ---
// Serve frontend files from the 'public' directory *relative to the build output ('dist')*
// Copy 'src/public' to 'dist/public' during the build
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log(`Serving static files from: ${publicPath}`);

// --- API Routes ---
app.use('/api/tasks', taskRoutes); // Mount task routes

// --- Health Check ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// --- Version Check ---
app.get('/version', (req: Request, res: Response) => {
  res.status(200).send(version);
});

// --- Base Route for Frontend ---
// Serve index.html for the root path AFTER API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// --- Global Error Handler (Basic) ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// --- Start Server ---
if (process.env.NODE_ENV !== 'test') {
  // Don't start server during tests
  app.listen(port, () => {
    console.log(`ToDo App Server listening on ${port}`);
  });
}

export default app;
