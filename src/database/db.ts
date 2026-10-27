import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Singleton variable to hold the database connection
let db: Database | null = null;

export async function initializeDatabase() {
    if (db) return db;

    // Connect to the database file (it will be created in the 'backend' folder)
    db = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    console.log('✅ [Database] Connected successfully.');

    // Create Master-Class Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            is_available BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS restaurant_tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number INTEGER UNIQUE NOT NULL,
            capacity INTEGER NOT NULL,
            status TEXT DEFAULT 'available', 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER,
            status TEXT DEFAULT 'pending', 
            total_amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            menu_item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
        );
    `);

    console.log('✅ [Database] Tables initialized successfully.');
    return db;
}

// Helper function to get the database instance anywhere in the app
export function getDb() {
    if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
    return db;
}