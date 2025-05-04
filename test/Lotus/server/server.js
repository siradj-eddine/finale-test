if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const initializePassport = require('./passport-config');
const cors = require('cors');



const db = new sqlite3.Database('./database.db', err => {
  if (err) {
      console.error('Could not connect to SQLite database', err);
      process.exit(1);
  } else {
      console.log('Connected to SQLite database.');
  }
});






db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('user', 'admin', 'superadmin')) DEFAULT 'user'
  )`);
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_one_superadmin 
    ON users(role) WHERE role = 'superadmin'`);

  // Create items table 
  db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT
  )`, (err) => {
      if (err) {
          console.error("Error creating items table:", err.message);
      } else {
          console.log("Items table is ready.");
      }
  });
});






function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
          if (err) return reject(err);
          resolve(row);
      });
  });
}

function getUserById(id) {
  return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          resolve(row);
      });
  });
}

initializePassport(passport, getUserByEmail, getUserById);





app.use(express.static(path.join(__dirname, "../Frontend/dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(cors({ origin: 'http://localhost:5173', 
  credentials: true
}));






app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html")); // Adjust path as needed
});

app.post('/login', (req, res, next) => {
  
  console.log('👉 [Login] req.body:', req.body);
  passport.authenticate('local', (err, user, info) => {
    console.log('👉 [Login] auth callback:', { err, user, info });

      console.log(err);
      if (!user) {
          console.error('User not found:', info);
          return res.status(401).json({ message: 'Invalid email or password' });
      }
      req.login(user, (err) => {
          if (err) {
              console.error('Login error:', err);
              return res.status(500).json({ message: 'Login failed' });
          }
          console.log('User logged in successfully:', user);
          return res.status(200).json({ message: 'Login successful', user });
      });
  })(req, res, next);
});




app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html")); // Adjust path as needed
});

app.post('/signup', async (req, res) => {
  try {
      const { name, email, password } = req.body;

      // Check if user already exists
      db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
          if (err) {
              console.error("Error querying user:", err);
              return res.status(500).json({ message: "Server error" });
          }

          if (row) {
              return res.status(400).json({ message: "Email already registered" });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          db.run(
              `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
              [name, email, hashedPassword],
              function (err) {
                  if (err) {
                      console.error("Error inserting user:", err);
                      return res.status(500).json({ message: "Registration failed" });
                  }
                  return res.status(201).json({ message: "Registration successful" });
              }
          );
      });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Registration failed" });
  }
});


app.post('/logout', (req, res) => {
req.logout(err => {  // Passport.js logout method
  if (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false });
  }
  // Destroy session and clear cookie
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ success: true });
  });
});
});
// app.delete('/logout', (req, res) => {
//     req.logout(err => {
//         if (err) {
//             console.error("Logout error:", err);
//             return res.status(500).send("Logout failed");
//         }
//         res.redirect('/login');
//     });
// });


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  // For API endpoints, send a JSON response rather than a redirect
  return res.status(401).json({ message: 'Not authenticated' });
}

function checkSuperAdmin(req, res, next) {
if (!req.isAuthenticated() || !req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super Admin required' });
}
next();
};

function checkAdmin(req, res, next) {
// First verify authentication and user existence
if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
}

// Then check roles with proper grouping
if (['admin', 'superadmin'].includes(req.user.role)) {
    return next();
}

return res.status(403).json({ message: 'Admin privileges required' });
}





app.post('/admin/add-item', checkAdmin, (req, res) => {
  const { id, category, price, description } = req.body;
  db.run(
    `INSERT INTO items (id, category, price, description) VALUES (?, ?, ?, ?)`,
    [id, category, price, description],
    function (err) {
      if (err) {
        console.error("Error adding item:", err.message);
        return res.status(500).send('Error adding item.');
      }
      res.send('Item added successfully!');
    }
  );
});


app.delete('/api/admin/products/:id', checkAdmin, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM items WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

app.delete('/api/admin/users/:id', checkAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});


app.patch('/api/admin/users/:id/role', checkSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user','admin','superadmin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ 
        error: 'Only existing superadmins can create new superadmins' 
    });
}
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function(err) {
    if (err) return res.status(500).json({ error: 'Update failed' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, role });
  });

});

app.get('/api/admin/products', (req, res) => {
  db.all(
    `SELECT id, category, price, description
     FROM items`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Error fetching products:", err.message);
        return res.status(500).json({ error: "Could not load products" });
      }
      res.json(rows);
    }
  );
});

app.get('/admin',  (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
});






app.get('/admin/users', checkAdmin, (req, res) => {
  db.all(
      "SELECT id, name, email, role FROM users",  [], (err, rows) => {
          if (err) {
              console.error("User fetch error:", err);
              return res.status(500).json({ error: 'Failed to fetch users' });
          }
          res.json(rows);
      }
  );
});


app.put('/admin/users/:id/role', checkSuperAdmin, async (req, res) => {
const { id } = req.params;
const { newRole } = req.body;

try {
  // Prevent privilege escalation
  if (newRole === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Cannot grant superadmin privileges' });
  }

  await db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [newRole, id]
  );

  res.json({ success: true });
} catch (err) {
  res.status(500).json({ error: 'Role update failed' });
}
});


app.get('/api/me', checkAuthenticated, (req, res) => {
res.json({ user: req.user });
});

app.get('/api/admin/users', checkAdmin, (req, res) => {
  db.all(
    "SELECT id, name, email, role FROM users",
    [],
    (err, rows) => {
      if (err) {
        console.error("User fetch error:", err);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(rows);
    }
  );
});


app.get('/api/me', checkAuthenticated, (req, res) => {
  // Return minimal user data needed for the frontend
  const { id, name, email, role } = req.user;
  res.json({ 
    user: { id, name, email, role } 
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// const multer = require('multer');
// const path = require('path');

// // Configure Multer storage
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'public/uploads/'); // Directory for uploaded images
//   },
//   filename: function(req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // Unique filename
//   }
// });
// const upload = multer({ storage });

// // Admin route to add an item with image upload
// app.post('/admin/add-item', checkAdmin, upload.single('image'), (req, res) => {
//     // req.body contains the text fields: name, price, description
//     // req.file contains the uploaded image info
//     const { name, price, description } = req.body;
//     const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

//     db.run(
//       `INSERT INTO items (name, price, description) VALUES (?, ?, ?)`,
//       [name, price, description],
//       function(err) {
//           if (err) {
//               console.error("Error adding item:", err.message);
//               return res.status(500).send('Error adding item.');
//           }
//           // Optionally, update the item record with the imagePath if needed,
//           // or have the table include an image column from the start.
//           res.send('Item added successfully!');
//       }
//     );
// });

