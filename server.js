const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Fs = require('fs').promises;
const Path = require('path');
const app = express();
const liveServer = require('live-server');

async function main() {

    app.use(cors());

    app.use(bodyParser.json());

    app.get('/listBooks', async (req, res) => {
        let books = await loadBooks()
        res.json(books);
    })

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

    app.delete('/removeBook/:id', async (req, res) => {
        let books = await loadBooks()
        if (!req.params.id) return res.status(400).json({ error: true, message: `'id' is required in the request body when calling 'updateBook'. Make sure you're stringifying the body of your request, and sending the appropriate headers.` })
        let bookToDelete = books.find(book => book.id === parseInt(req.params.id));
        if (!bookToDelete) return res.status(404).json({ error: true, message: `Could not find a book with an id of ${req.body.id}` })
        books = books.filter(book => book !== bookToDelete);
        await saveBooks(books)
        res.json(bookToDelete)
    })

    app.listen(3001, () => {
        liveServer.start({
            port: 3000,
            logLevel: 0,
            root: './public'
        })
    })
}

const DB_PATH = Path.join(__dirname, 'db.json')

async function loadBooks() {
    let { books } = JSON.parse(await Fs.readFile(DB_PATH))
    return books
}

async function saveBooks(books) {
    await Fs.writeFile(DB_PATH, JSON.stringify({ books }, null, 2))
}
// easyJake
main()