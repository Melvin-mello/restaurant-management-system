import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/db';
import menuRoutes from './routes/menuRoutes';
import tableRoutes from './routes/tableRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. ROUTE REGISTRATION (All connected!)
// ==========================================
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);

// ==========================================
// 3. BASE ROUTES
// ==========================================
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
        message: 'Welcome to the Restaurant Management API',
        status: 'Online',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server and Database are running smoothly.' 
    });
});

// ==========================================
// 4. ERROR HANDLING
// ==========================================
app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        error: 'Not Found', 
        message: `Route ${req.originalUrl} not found` 
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('🔥 Global Error:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// ==========================================
// 5. START SERVER & DATABASE
// ==========================================
async function startServer() {
    try {
        console.log('⏳ [Database] Initializing...');
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 [Server] is running on http://localhost:${PORT}`);
            console.log(`📂 [Environment] ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ [Server] Failed to start:', error);
        process.exit(1);
    }
}

startServer();