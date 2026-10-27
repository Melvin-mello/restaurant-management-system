import { Router, Request, Response } from 'express';
import { getDb } from '../database/db';

const router = Router();

// GET all tables
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const tables = await db.all('SELECT * FROM restaurant_tables ORDER BY table_number ASC');
        res.status(200).json({ success: true, data: tables });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch tables' });
    }
});

// POST a new table
router.post('/', async (req: Request, res: Response) => {
    try {
        const { table_number, capacity } = req.body;
        if (!table_number || !capacity) {
            return res.status(400).json({ success: false, error: 'Table number and capacity are required' });
        }
        const db = getDb();
        const result = await db.run('INSERT INTO restaurant_tables (table_number, capacity) VALUES (?, ?)', [table_number, capacity]);
        const newTable = await db.get('SELECT * FROM restaurant_tables WHERE id = ?', [result.lastID]);
        res.status(201).json({ success: true, data: newTable });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, error: 'Table number already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create table' });
    }
});

export default router;
