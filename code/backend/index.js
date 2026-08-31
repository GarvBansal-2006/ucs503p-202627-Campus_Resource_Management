import express from 'express';
import cors from 'cors';
import connectDB from './db.js'; 
import availabilityRoutes from './routes/availabilityRoutes.js'; // <-- Import this

const app = express();
const PORT = 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/availability', availabilityRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});