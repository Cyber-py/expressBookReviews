const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const newUser = { username, password };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully" });
});
public_users.get('/',function (req, res) {
  res.json(JSON.stringify(books, null, 2)); // Formatted JSON response
});


public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/api/books/${isbn}`);
    res.json(response.data);
  } catch (error) {
    if (error.response &amp;&amp; error.response.status === 404) {
      res.status(404).json({ message: "Book not found" });
    } else {
      res.status(500).json({ message: "Error fetching book", error: error.message });
    }
  }
});

// Add routes to serve individual book data (needed for Axios)
public_users.get('/api/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" }); // Important for Axios to handle 404
  }
});


public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/api/books/author/${author}`);
    res.json(response.data);
  } catch (error) {
    if (error.response &amp;&amp; error.response.status === 404) {
      res.status(404).json({ message: "No books found for this author" });
    } else {
      res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
  }
});

public_users.get('/api/books/author/:author', (req, res) => {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);
  if (booksByAuthor.length === 0) {
    res.status(404).json({ message: "No books found for this author" }); // Important for Axios
  } else {
    res.json(booksByAuthor);
  }
});

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/api/books/title/${title}`);
    res.json(response.data);
  } catch (error) {
    if (error.response &amp;&amp; error.response.status === 404) {
      res.status(404).json({ message: "No books found with this title" });
    } else {
      res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
  }
});

public_users.get('/api/books/title/:title', (req, res) => {
  const title = req.params.title;
  const booksWithTitle = Object.values(books).filter(book => book.title === title);

  if (booksWithTitle.length === 0) {
    res.status(404).json({ message: "No books found with this title" }); // Important for Axios
  } else {
    res.json(booksWithTitle);
  }
});

public_users.get('/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.json(book.reviews || {}); // Return reviews or empty object if none
});

module.exports.general = public_users;
