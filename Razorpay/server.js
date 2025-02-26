import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import paymentRoute from './routes/paymentRoute.js';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', paymentRoute);

const PORT = process.env.PORT || 2122;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
