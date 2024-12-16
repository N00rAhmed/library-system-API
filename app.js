const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const config = require('./dbconfig');

const app = express();
const port = 4000;

const jwt = require('jsonwebtoken');
const SECRET_KEY = '7N84V'; // Replace with a strong secret key
const bcrypt = require('bcrypt');


// Parse JSON request body
app.use(express.json());

const cors = require('cors');
app.use(cors());

// Define a simple route
app.get('/', (req, res) => {
    res.send('Find Books: /api/books');
});

// Create connection to SQLite database
let db = new sqlite3.Database(config.DB, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Define a route to query books data
app.get('/api/books', (req, res) => {
    db.all(`SELECT * FROM books`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ books: rows });
    });
});


// Define a route to query books data
app.get('/api/media', (req, res) => {
    db.all(`SELECT * FROM media`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ media: rows });
    });
});

// Define a route to delete a book by ID
app.delete('/api/media/:id', (req, res) => {
    const { id } = req.params;

    // Use parameterized query to prevent SQL injection
    db.run(`DELETE FROM media WHERE id = ?`, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: "Book not found" });
            return;
        }

        res.json({ message: "Book deleted successfully!" });
    });
});


app.post('/api/books', (req, res) => {
    const { name, genre, publishedate } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: "Book name is required." });
    }
    if (!genre) {
        return res.status(400).json({ error: "Genre is required." });
    }
    if (!publishedate) {
        return res.status(400).json({ error: "Publish date is required." });
    }

    // SQL query to insert a new book with NULL userid (not borrowed)
    const query = `INSERT INTO books (name, genre, publishedate, userid) VALUES (?, ?, ?, NULL)`;
    const params = [name, genre, publishedate];

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: "Book added successfully!",
            bookId: this.lastID, // Returns the ID of the newly added book
        });
    });
});








app.delete('/api/books/:bookid', (req, res) => {
    const { bookid } = req.params;

    // Validate input
    if (!bookid) {
        return res.status(400).json({ error: "Book ID is required." });
    }

    // SQL query to delete the book by its ID
    const query = `DELETE FROM books WHERE bookid = ?`;
    db.run(query, [bookid], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Book not found." });
        }
        res.status(200).json({ message: "Book deleted successfully!" });
    });
});




const saltRounds = 10; // Define the salt rounds for hashing

app.post('/api/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
        return res.status(400).json({ error: "Full name, email, and password are required." });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the user into the database
        const query = `INSERT INTO User (full_name, email, password) VALUES (?, ?, ?)`;
        const params = [full_name, email, hashedPassword];

        db.run(query, params, function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "User registered successfully!", userId: this.lastID });
        });
    } catch (err) {
        console.error("Error hashing password:", err.message);
        res.status(500).json({ error: "Failed to register user. Please try again later." });
    }
});


app.get('/api/register', (req, res) => {
    db.all(`SELECT * FROM User`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users: rows });
    });
});
app.delete('/api/register/:id', (req, res) => {
    const userId = req.params.id;

    db.run(`DELETE FROM User WHERE userid = ?`, [userId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({ message: "User deleted successfully" });
    });
});

// Update user endpoint
app.put("/api/register/:userid", (req, res) => {
    const { userid } = req.params;
    const { full_name, email, password } = req.body;
  
    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    const sql = `UPDATE User SET full_name = ?, email = ?, password = ? WHERE userid = ?`;
    const params = [full_name, email, password, userid];
  
    db.run(sql, params, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, message: "User updated successfully" });
    });
  });
  


app.post('/api/registerbranchlib', (req, res) => {
    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
        return res.status(400).json({ error: "Full name, email, and password are required." });
    }

    const query = `INSERT INTO BranchLibrarian (full_name, email, password) VALUES (?, ?, ?)`;
    const params = [full_name, email, password];

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "User registered successfully!", userId: this.lastID });
    });
});


app.get('/api/registerbranchlib', (req, res) => {
    db.all(`SELECT * FROM BranchLibrarian`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users: rows });
    });
});

app.post('/api/addmedia', (req, res) => {
    const { name, genre, publishedate, mediatype } = req.body;

    // Validate required fields
    if (!name || !genre || !publishedate || !mediatype) {
        return res.status(400).json({ error: "User ID, name, genre, publish date, and media type are required." });
    }

    // SQL query to insert media into the media table
    const query = `
        INSERT INTO media (name, genre, publishedate, mediatype)
        VALUES (?, ?, ?, ?)
    `;
    const params = [name, genre, publishedate, mediatype];

    // Execute the query to insert data
    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Respond with a success message and the ID of the newly added media
        res.status(201).json({
            message: "Media added successfully!",
            mediaId: this.lastID, // lastID will return the auto-incremented ID of the newly inserted row
        });
    });
});

// Admin login endpoint
app.post('/api/adminlogin', (req, res) => {
    const { email, password } = req.body; // Just extract email and password from the request body

    // If either email or password is not provided, return a 400 error
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // Update the query to use email and password only
    const query = `SELECT * FROM Admin WHERE email = ? AND password = ?`;
    const params = [email, password];

    db.get(query, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate a JWT token and include the userId and email in the token
        const token = jwt.sign({ userId: row.userid, email: row.email }, SECRET_KEY, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Respond with the token and user details
        res.json({ 
            message: "Login successful!", 
            token, 
            user: { id: row.userid, email: row.email, fullName: row.full_name } 
        });
    });
});



// Admin login endpoint
app.post('/api/branchlibrarian', (req, res) => {
    const { email, password } = req.body; // Just extract email and password from the request body

    // If either email or password is not provided, return a 400 error
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // Update the query to use email and password only
    const query = `SELECT * FROM BranchLibrarian WHERE email = ? AND password = ?`;
    const params = [email, password];

    db.get(query, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate a JWT token and include the userId and email in the token
        const token = jwt.sign({ BranchLibrarianID: row.userid, email: row.email }, SECRET_KEY, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Respond with the token and user details
        res.json({ 
            message: "Login successful!", 
            token, 
            user: { id: row.BranchLibrarianID, email: row.email, fullName: row.full_name } 
        });
    });
});

app.post('/api/branchlibrarian', (req, res) => {
    // Logout simply clears the client token.
    // Optionally, add the token to a server-side blacklist if you want to invalidate it completely.
    res.json({ message: "Logout successful!" });
});

// const authenticateTokenAdmin = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

//     if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

//     jwt.verify(token, SECRET_KEY, (err, user) => {
//         if (err) return res.status(403).json({ error: "Invalid token." });

//         req.user = user; // Attach user info to the request
//         next();
//     });
// };

app.post('/api/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // Update query to select the hashed password
    const query = `SELECT * FROM User WHERE email = ?`;
    const params = [email];

    db.get(query, params, async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Compare the hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, row.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate a JWT token and include the userId and email in the token
        const token = jwt.sign({ userId: row.userid, email: row.email }, SECRET_KEY, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Respond with the token and user details
        res.json({
            message: "Login successful!",
            token,
            user: { id: row.userid, email: row.email, fullName: row.full_name }
        });
    });
});




const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token." });

        req.user = user; // Attach user info to the request
        next();
    });
};


app.get('/api/user', authenticateToken, (req, res) => {
    const { userId } = req.user; // Extract userId from the token

    const query = `SELECT full_name FROM User WHERE userid = ?`;
    const params = [userId];

    db.get(query, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ fullName: row.full_name });
    });
});


// PROFILE ACCOUNT INFO
app.get('/api/useraccountinfo', authenticateToken, (req, res) => {
    const { userId } = req.user; // Extract userId from the token

    const query = `SELECT full_name, email, password FROM User WHERE userid = ?`;
    const params = [userId];

    db.get(query, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json(row);
    });
});




app.post('/api/logout', (req, res) => {
    // Logout simply clears the client token.
    // Optionally, add the token to a server-side blacklist if you want to invalidate it completely.
    res.json({ message: "Logout successful!" });
});


// app.post('/api/borrow', authenticateToken, (req, res) => {
//     const { userId } = req.user; // Extracted from token
//     const { id } = req.body;
//     console.log("User ID:", userId); // Log userId
//     console.log("ID:", id); // Log bookId

//     const query = `UPDATE media SET userid = ? WHERE id = ? AND userid IS NULL`;
//     const params = [userId, id];

//     db.run(query, params, function (err) {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         if (this.changes === 0) {
//             return res.status(400).json({ error: "Book is already borrowed or doesn't exist." });
//         }
//         res.status(200).json({ message: "Book borrowed successfully!" });
//     });
// });
app.post('/api/borrow', authenticateToken, (req, res) => {
    const { userId } = req.user; // Extracted from the token
    const { id } = req.body; // Media ID to be borrowed

    // Get the current date and format it as "day-month-year"
    const currentDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date());

    // Check if media can be borrowed and assign userId to it
    const updateMediaQuery = `UPDATE media SET userid = ? WHERE id = ? AND userid IS NULL`;
    const params = [userId, id];

    db.run(updateMediaQuery, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(400).json({ error: "Media is already borrowed or doesn't exist." });
        }

        // Fetch media details to insert into borrowing history
        const fetchMediaQuery = `SELECT name, genre, publishedate FROM media WHERE id = ?`;
        db.get(fetchMediaQuery, [id], (err, media) => {
            if (err) {
                return res.status(500).json({ error: "Failed to fetch media details." });
            }
            if (!media) {
                return res.status(400).json({ error: "Media details not found." });
            }

            // Insert record into borrowing history with the current date
            const insertHistoryQuery = `
                INSERT INTO borrowinghistory (userid, bookname, genre, publishedate, dateborrowed)
                VALUES (?, ?, ?, ?, ?)
            `;
            const historyParams = [userId, media.name, media.genre, media.publishedate, currentDate];

            db.run(insertHistoryQuery, historyParams, function (err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to update borrowing history." });
                }
                res.status(200).json({ message: "Media borrowed successfully and history updated!" });
            });
        });
    });
});




app.get('/api/borrowed-books', authenticateToken, (req, res) => {
    const { userId } = req.user; // Extract userId from the token

    const query = `SELECT * FROM media WHERE userid = ?`;
    const params = [userId];

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "No borrowed books found." });
        }

        res.status(200).json({ borrowedBooks: rows });
    });
});


app.post('/api/return', authenticateToken, (req, res) => {
    const { userId } = req.user; // Extracted from token
    const { id } = req.body;

    const query = `UPDATE media SET userid = NULL WHERE id = ? AND userid = ?`;
    const params = [id, userId];

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(400).json({ error: "Book not found or not borrowed by this user." });
        }
        res.status(200).json({ message: "Book returned successfully!" });
    });
});




app.get('/api/borrow/history', authenticateToken, (req, res) => {
    const { userId } = req.user; // Extract userId from the token

    const query = `
        SELECT borrowinghistoryid, bookname, genre, publishedate, dateborrowed
        FROM borrowinghistory
        WHERE userid = ?
        ORDER BY dateborrowed DESC
    `;
    const params = [userId];

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch borrowing history." });
        }
        res.status(200).json({ history: rows });
    });
});




// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Close the database connection when the process is terminated
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
