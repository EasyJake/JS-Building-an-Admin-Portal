// Required modules for the project
const express = require('express'); // helps to set up the server easily
const cors = require('cors'); // enables cross-origin resource sharing
const bodyParser = require('body-parser'); // for handling request body
const Fs = require('fs').promises; // for reading/writing files (async version)
const Path = require('path'); // for handling file paths
const app = express(); // creates an Express application
const liveServer = require('live-server'); // for a live-reloading dev server


// Main function to set up the server
async function main() {
    app.use(cors()); // use cors middleware for enabling cross-origin requests

    app.use(bodyParser.json()); // for parsing application/json

   // Route to list all books
   app.get('/listBooks', async (req, res) => {
    let books = await loadBooks(); // loads books from file
    res.json(books); // sends books as JSON response
});
// Route to update a book
    app.patch('/updateBook', async (req, res) => {
        let books = await loadBooks()
        if (!req.body.id) return res.status(400).json({ error: true, message: `'id' is required in the request body when calling 'updateBook'. Make sure you're stringifying the body of your request, and sending the appropriate headers.` })
        let book = books.find(book => book.id === req.body.id);
        if (!book) return res.status(404).json({ error: true, message: `Could not find a book with an id of ${req.body.id}` })
        const { title, year, quantity, imageURL, description } = { ...book, ...req.body };
        Object.assign(book, { title, year, quantity, imageURL, description });
        await saveBooks(books)
        res.json(book)
    })

  // Route to add a new book
    app.post('/addBook', async (req, res) => {
        let books = await loadBooks()
        if (!req.body.title) return res.status(400).json({ error: true, message: `'title' is required in the request body when calling 'addBook'. Make sure you're stringifying the body of your request, and sending the appropriate headers.` })
        if (!req.body.quantity) return res.status(400).json({ error: true, message: `'quantity' is required in the request body when calling 'addBook'. Make sure you're stringifying the body of your request, and sending the appropriate headers.` })
        if (!req.body.description) return res.status(400).json({ error: true, message: `'description' is required in the request body when calling 'addBook'. Make sure you're stringifying the body of your request, and sending the appropriate headers.` })

        const { title, year, quantity, imageURL, description } = req.body;
        const id = books.reduce((id, book) => Math.max(book.id + 1, id), 1);
        const book = { id, title, year, quantity, imageURL, description }
        books.push(book);
        await saveBooks(books)
        res.json(book)
    })
// Route to remove a book
    app.delete('/removeBook/:id', async (req, res) => {
        let books = await loadBooks()
        if (!req.params.id) return res.status(400).json({ error: true, message: `'id' is required in the request body when calling 'updateBook'. Make sure you're stringifying the body of your request, and sending the appropriate headers.` })
        let bookToDelete = books.find(book => book.id === parseInt(req.params.id));
        if (!bookToDelete) return res.status(404).json({ error: true, message: `Could not find a book with an id of ${req.body.id}` })
        books = books.filter(book => book !== bookToDelete);
        await saveBooks(books)
        res.json(bookToDelete)
    })

// Start the server and listen on a port
    app.listen(3001, () => {
        // Start a dev server with live-reload functionality
        liveServer.start({
            port: 3000, // dev server port
            logLevel: 0, // suppresses log messages
            root: './public' // the root from where to serve public files
        })
    })
}

// Path to the 'database' file
const DB_PATH = Path.join(__dirname, 'db.json');

// Function to load books from the 'database' file
const DB_PATH = Path.join(__dirname, 'db.json')

// Function to load books from the 'database' file
async function loadBooks() {
    let { books } = JSON.parse(await Fs.readFile(DB_PATH))
    return books
}

// Function to save books to the 'database'
async function saveBooks(books) {
    await Fs.writeFile(DB_PATH, JSON.stringify({ books }, null, 2))
}

// Start the application
main(); // calls the async function, starting the server setup