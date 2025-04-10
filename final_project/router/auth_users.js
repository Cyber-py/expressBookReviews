const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if (typeof username !== 'string' || username.trim() === '') {
    return false;
  }
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(user => user.username === username);
  if (user && user.password === password) {
    return true;
  }
  return false;
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, "your-secret-key"); // Replace with a strong secret key
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, "your-secret-key"); // Use the same secret key as in login
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
      return res.status(400).json({ message: "Review text is required" });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added successfully" });

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(user => user.username === username);

  if (!user || user.password !== password) { // Corrected authentication check
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, "your-secret-key");
  res.json({ message: "Login successful", token }); // Send token in response
});


regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review; // Get review from request body
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
      return res.status(400).json({ message: "Review text is required" });
    }

    books[isbn].reviews[username] = review; // Store/update review

    res.json({ message: "Review added/modified successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
