import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tools  from './tools.mjs'
//import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
//const bcrypt = require('bcrypt');
//const db = require('./db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static('src'));
app.use(cookieParser());

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Define the directory for static files
app.use(express.static(path.join(__dirname, 'public')));

let contract = await tools.constructSmartContract();

// Main Page
app.get('/', (req, res) => {
    res.redirect('/login');
});

/*app.post('/user-auth', async (req, res) => {
    const providedAddr = req.body.address;
    const providedPassword = req.body.password;
    const allowedAddressesAndPasswords = [
        { address: 'abc', password: 'abc' }, // Example entry with plain text password
        // Add more entries for allowed addresses and their corresponding plain text passwords
    ];

    try {
        console.log(`Authenticating user with address: ${providedAddr}`);

        // Find the entry for the provided address in the allowedAddressesAndPasswords array
        const userEntry = allowedAddressesAndPasswords.find(entry => entry.address === providedAddr);

        // If userEntry is undefined, the provided address is not in the list of allowed addresses
        if (!userEntry) {
            console.warn("User not authorized.");
            res.status(401).send('Unauthorized');
            return;
        }

        // Compare the provided password with the plain text password stored in the entry
        const passwordMatch = providedPassword === userEntry.password;

        if (passwordMatch) {
            console.log("User authenticated successfully.");
            res.cookie('addr', providedAddr);
            res.redirect('/dashboard');
        } else {
            console.warn("Invalid password.");
            res.status(401).send('Unauthorized');
        }
    } catch (err) {
        console.error("Error authenticating user:", err);
        res.status(500).send('Authentication Failed');
    }
});*/


// Admin Login
app.get('/login', (req, res) => {
    res.render('pages/login');
});

/*app.post('/addmovie', async (req, res) => {
    const addr = req.body.address;
    // Perform owner authentication logic if needed
    res.cookie('addr', addr);
    res.redirect('/addmovie');
});*/

// Admin Route to Handle Add Movie Form Submission
/*app.post('/addmovie', async (req, res) => {
    const { title, totalSeats, totalTickets } = req.body;
    try {
        console.log(`Adding new movie: ${title}`);
        let tx = await contract.createMovie(title, totalSeats, totalTickets);
        console.log("Movie added successfully:", tx);
        res.redirect('/'); // Redirect to home or admin page after adding movie
    } catch (err) {
        console.error("Error adding movie:", err);
        res.status(500).send('Failed to add movie');
    }
});*/

/*// User Registration
app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/register', async (req, res) => {
    const addr = req.body.address;
    try {
        console.log(`Registering user with address: ${addr}`);
        let tx = await contract.registerUser(addr);
        console.log("User registered successfully:", tx);
        res.redirect('/login');
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send('Registration Failed');
    }
});*/

// User Dashboard
app.get('/dashboard', (req, res) => {
    const addr = req.cookies.addr;
    res.render('pages/dashboard', { addr });
});

/*// User View Movies and Buy Tickets
app.get('/movies', async (req, res) => {
    try {
        console.log("Fetching all movies for user...");
        const movies = await contract.getAllMovies(); // Assuming a function to get all movies
        console.log("Movies fetched successfully.");
        res.render('pages/movies', { movies });
    } catch (error) {
        console.error("Error in GET /user/movies route:", error);
        res.status(500).send('Internal Server Error');
    }
});*/

app.get('/buyTicket', (req, res) => {
    res.render('pages/buyTicket');
});

app.post('/buyTicket', async (req, res) => {
    const { movieId, seatNumber, numTickets } = req.body;
    const addr = req.cookies.addr;
    try {
        console.log(`User ${addr} buying ticket(s) for movieId ${movieId} with seatNumber ${seatNumber} and numTickets ${numTickets}`);
        let tx = await contract.buyTicket(movieId, seatNumber, numTickets, { from: addr });
        console.log("Ticket purchase successful:", tx);
        res.redirect('/movies');
    } catch (err) {
        console.error("Error buying ticket:", err);
        res.status(500).send('Failed to buy ticket');
    }
});

// Transfer Ticket
app.get('/transferTicket', (req, res) => {
    res.render('pages/transferTicket');
});

app.post('/transferTicket', async (req, res) => {
    const { ticketId, toAddress } = req.body;
    const addr = req.cookies.addr;
    try {
        console.log(`User ${addr} transferring ticket ID ${ticketId} to address ${toAddress}`);
        let tx = await contract.transferTicket(ticketId, toAddress, { from: addr });
        console.log("Ticket transfer successful:", tx);
        res.redirect('/movies');
    } catch (err) {
        console.error("Error transferring ticket:", err);
        res.status(500).send('Failed to transfer ticket');
    }
});

app.get('/viewTicket/:ticketId', async (req, res) => {
    const ticketId = req.params.ticketId;

    try {
        // Call the getTicketDetails function from the smart contract
        const ticketDetails = await contract.methods.getTicketDetails(ticketId).call();

        // Assuming you have a viewTicket.ejs file to render ticket details
        res.render('pages/viewTicket', { ticketDetails });
    } catch (error) {
        // Handle errors
        console.error('Error fetching ticket details:', error);
        res.status(500).send('Error fetching ticket details');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
