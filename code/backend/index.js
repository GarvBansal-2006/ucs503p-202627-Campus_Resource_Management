import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './db.js'; 
import availabilityRoutes from './routes/availabilityRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/availability', availabilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend static files if built (for single-service deployment)
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});