
import express from "express";

const app = express();
const PORT = 4000;

// Middleware: Parse incoming JSON
app.use(express.json());

// Sample book records
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 350
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        price: 450
    },
    {
        id: 3,
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        price: 300
    }
];

// Validate book data
function isValidBook(data) {
    return (
        data &&
        Number.isInteger(data.id) &&
        data.id > 0 &&
        typeof data.title === "string" &&
        data.title.trim().length > 0 &&
        typeof data.author === "string" &&
        data.author.trim().length > 0 &&
        typeof data.price === "number" &&
        Number.isFinite(data.price) &&
        data.price >= 0
    );
}

// GET / - Welcome route
app.get("/", (req, res) => {
    res.send("Welcome to Express Library Management System");
});

// GET /books - Get all books
app.get("/books", (req, res) => {
    res.status(200).json(books);
});

// GET /books/:id - Get book by ID
app.get("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// POST /books - Add a new book
app.post("/books", (req, res) => {

    const newBook = req.body;

    if (!isValidBook(newBook)) {
        return res.status(400).json({
            message: "Please provide valid book details"
        });
    }

    const exists = books.some(
        book => book.id === newBook.id
    );

    if (exists) {
        return res.status(409).json({
            message: "Book ID already exists"
        });
    }

    const book = {
        id: newBook.id,
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        price: newBook.price
    };

    books.push(book);

    res.status(201).json({
        message: "Book added successfully",
        book
    });
});

// PUT /books/:id - Update a book
app.put("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex(
        book => book.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const updatedBook = req.body;

    if (!isValidBook(updatedBook)) {
        return res.status(400).json({
            message: "Please provide valid book details"
        });
    }

    if (updatedBook.id !== id) {
        return res.status(400).json({
            message: "Book ID cannot be changed"
        });
    }

    books[index] = {
        id,
        title: updatedBook.title.trim(),
        author: updatedBook.author.trim(),
        price: updatedBook.price
    };

    res.status(200).json({
        message: "Book updated successfully",
        book: books[index]
    });
});

// DELETE /books/:id - Delete a book
app.delete("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex(
        book => book.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Internal Server Error"
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "404 - Route Not Found"
    });
});

// Start Express server
app.listen(PORT, () => {
    console.log(
        `Express Server running at http://localhost:${PORT}`
    );
});
