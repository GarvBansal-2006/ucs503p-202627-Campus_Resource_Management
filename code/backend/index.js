import express from 'express';
import cors from 'cors';
import connectDB from './db.js'; 
import availabilityRoutes from './routes/availabilityRoutes.js';
import authRoutes from './routes/authRoutes.js';

import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/availability', availabilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});