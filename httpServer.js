
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(data, null, 2));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {

    const url = new URL(
        req.url,
        `http://${req.headers.host || "localhost"}`
    );

    const pathname = url.pathname;
    const method = req.method;

    try {

        // GET /
        if (pathname === "/" && method === "GET") {

            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });

            res.end(`
                <h1>Welcome to Library Management System</h1>
                <p>Manage your books easily.</p>
            `);
        }

        // GET /books
        else if (pathname === "/books" && method === "GET") {

            sendJSON(res, 200, books);
        }

        // GET /about
        else if (pathname === "/about" && method === "GET") {

            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });

            res.end(`
                <h1>About Library</h1>
                <p>This is a Library Book Management Application.</p>
                <p>Developed using Node.js HTTP and FS modules.</p>
            `);
        }

        // GET /home - Read HTML using FS module
        else if (pathname === "/home" && method === "GET") {

            const filePath = path.join(
                __dirname,
                "public",
                "index.html"
            );

            fs.readFile(filePath, "utf8", (err, data) => {

                if (err) {
                    sendJSON(res, 500, {
                        message: "Error reading HTML file"
                    });
                    return;
                }

                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });

                res.end(data);
            });
        }

        // POST /add-book
        else if (pathname === "/add-book" && method === "POST") {

            let body = "";
            let tooLarge = false;

            for await (const chunk of req) {

                body += chunk.toString();

                if (Buffer.byteLength(body) > 1024 * 1024) {
                    tooLarge = true;
                    break;
                }
            }

            if (tooLarge) {
                sendJSON(res, 413, {
                    message: "Request body too large"
                });
                return;
            }

            let newBook;

            try {
                newBook = JSON.parse(body);
            } catch {
                sendJSON(res, 400, {
                    message: "Invalid JSON format"
                });
                return;
            }

            const { id, title, author, price } = newBook || {};

            // Validate book details
            if (
                !Number.isInteger(id) ||
                id <= 0 ||
                typeof title !== "string" ||
                !title.trim() ||
                typeof author !== "string" ||
                !author.trim() ||
                typeof price !== "number" ||
                !Number.isFinite(price) ||
                price < 0
            ) {

                sendJSON(res, 400, {
                    message: "Please provide valid book details"
                });

                return;
            }

            // Check duplicate ID
            if (books.some(book => book.id === id)) {

                sendJSON(res, 409, {
                    message: "Book ID already exists"
                });

                return;
            }

            // Add new book
            const book = {
                id,
                title: title.trim(),
                author: author.trim(),
                price
            };

            books.push(book);

            sendJSON(res, 201, {
                message: "Book added successfully",
                book
            });
        }

        // Invalid route
        else {

            sendJSON(res, 404, {
                message: "404 - Route Not Found"
            });
        }

    } catch (error) {

        if (!res.headersSent) {
            sendJSON(res, 500, {
                message: "Internal Server Error"
            });
        }
    }

});

// Start server
const PORT = 3000;

server.listen(PORT, () => {
    console.log(
        `HTTP Server running at http://localhost:${PORT}`
    );
});

// Handle server errors
server.on("error", (error) => {
    console.error("Server error:", error.message);
});
