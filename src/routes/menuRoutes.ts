import { Router, Request, Response } from 'express';
import { getDb } from '../database/db';

const router = Router();

// GET all menu items
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const items = await db.all('SELECT * FROM menu_items ORDER BY id DESC');
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
    }
});

// POST a new menu item
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, is_available } = req.body;

        if (!name || price === undefined || !category) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, price, and category are required' 
            });
        }

        const db = getDb();
        const result = await db.run(
            `INSERT INTO menu_items (name, description, price, category, is_available) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, description || '', price, category, is_available !== undefined ? is_available : true]
        );

        const newItem = await db.get('SELECT * FROM menu_items WHERE id = ?', [result.lastID]);
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ success: false, error: 'Failed to create menu item' });
    }
});

// DELETE a menu item
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const db = getDb();
        const result = await db.run('DELETE FROM menu_items WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }

        res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, error: 'Failed to delete menu item' });
    }
});

export default router;
