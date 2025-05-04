const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', err => {
  if (err) {
    console.error('Could not open database:', err);
    process.exit(1);
  }
});

const products = [
  {id: 1, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
  {id: 2, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
  {id: 3, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id: 4, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id: 5, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id: 6, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id: 7, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id: 8, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id: 9, category: 'Shoes', price: 50,description: 'This is a pair of shoes'},
    {id:10, category: 'Pants', price: 50,description: 'This is a pair of pants'},
    {id:11, category: 'Pants', price: 50,description: 'This is a pair of pants'}, 
    {id:12, category: 'Pants', price: 50,description: 'This is a pair of pants'},
    {id:13, category: 'Pants', price: 50,description: 'This is a pair of pants'},
    {id:14, category: 'Pants', price: 50,description: 'This is a pair of pants'},
    {id:15, category: 'Pants', price: 50,description: 'This is a pair of pants'},
    {id:16, category: 'Pants', price: 50,description: 'This is a pair of pants'},
    {id:17, category: 'Pants', price: 50,description: 'This is a pair of pants'},  
    {id:19, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:20, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:21, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:22, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:23, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:24, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:25, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:26, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    {id:27, category: 't-shirts', price: 50,description: 'This is a t-shirt'},
    { id: 100, name: 'Stylish Jacket', description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur, sed?`, price: 49.99, category: 'Men' },
    {id:32, category: 'hats', price: 50,description: 'This is a Hat'} ,
    {id:33, category: 'hats', price: 50,description: 'This is a Hat'} ,
    {id:34, category: 'hats', price: 50,description: 'This is a Hat'} ,
    {id:35, category: 'hats', price: 50,description: 'This is a Hat'} ,
    { id: 103, name: 'Trendy Sneakers', description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur, sed?`, price: 59.99, category: 'Accessories' },
    {id:36, category: 'hats', price: 50,description: 'This is a Hat'} ,
    {id:37, category: 'hats', price: 50,description: 'This is a Hat'} ,
    { id: 102, name: 'Elegant Dress', description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur, sed?`, price: 79.99, category: 'Women' },
    {id:38, category: 'hats', price: 50,description: 'This is a Hat'} ,
    {id:39, category: 'hats', price: 50,description: 'This is a Hat'} ,
    { id: 101, name: 'Casual T-Shirt', description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur,`, price: 19.99, category: 'Men' },
  ];

  db.serialize(() => {
   
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO items (id, category, price, description)
       VALUES (?, ?, ?, ?)`
    );
  
    for (const p of products) {
      stmt.run(p.id, p.category, p.price, p.description, err => {
        if (err) {
          console.error(`Error inserting item id=${p.id}:`, err.message);
        } else {
          console.log(`Inserted (or skipped duplicate) item id=${p.id}`);
        }
      });
    }
  
    stmt.finalize(err => {
      if (err) console.error('Finalize error:', err.message);
      db.close();
      console.log('Seeding complete, connection closed.');
    });
  });
