import { Router, Request, Response } from 'express';
import { getDb } from '../database/db';

const router = Router();

// GET all orders (with table info)
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const orders = await db.all(`
            SELECT o.id, o.table_id, o.status, o.total_amount, o.created_at, t.table_number 
            FROM orders o 
            LEFT JOIN restaurant_tables t ON o.table_id = t.id 
            ORDER BY o.created_at DESC
        `);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// POST a new order
router.post('/', async (req: Request, res: Response) => {
    try {
        const { table_id, items } = req.body; // items is an array of { menu_item_id, quantity }
        if (!table_id || !items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Table ID and at least one item are required' });
        }

        const db = getDb();
        
        // 1. Create the order
        const orderResult = await db.run('INSERT INTO orders (table_id, status, total_amount) VALUES (?, ?, ?)', [table_id, 'pending', 0]);
        const orderId = orderResult.lastID;

        let totalAmount = 0;

        // 2. Add items to the order and calculate total
        for (const item of items) {
            const menuItem = await db.get('SELECT price FROM menu_items WHERE id = ?', [item.menu_item_id]);
            if (!menuItem) {
                return res.status(400).json({ success: false, error: `Menu item ${item.menu_item_id} not found` });
            }
            
            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            await db.run(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.menu_item_id, item.quantity, menuItem.price]
            );
        }

        // 3. Update the order with the final total amount
        await db.run('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId]);

        // 4. Update table status to 'occupied'
        await db.run('UPDATE restaurant_tables SET status = ? WHERE id = ?', ['occupied', table_id]);

        const finalOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
        res.status(201).json({ success: true, data: finalOrder });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

export default router;
