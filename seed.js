// seed.js (Root directory)
import Database from 'better-sqlite3';
import fs from 'fs';
import { fetchCategoriesFromAPI } from './src/api/categories.js';

const dbFile = 'categories.db';

if (fs.existsSync(dbFile)) {
  console.log('categories.db already exists. Skipping download.');
  process.exit(0);
}

const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  )
`);

async function runSeed() {
  try {
    console.log('Fetching categories from wger API...');
    const categories = await fetchCategoriesFromAPI();

    if (categories.length === 0) {
      console.log('No categories fetched.');
      return;
    }

    const insert = db.prepare('INSERT OR REPLACE INTO categories (id, name) VALUES (?, ?)');
    const insertMany = db.transaction((cats) => {
      for (const cat of cats) {
        insert.run(cat.id, cat.name);
      }
    });

    insertMany(categories);
    console.log(`Successfully saved ${categories.length} categories to categories.db!`);
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    db.close();
  }
}

runSeed();