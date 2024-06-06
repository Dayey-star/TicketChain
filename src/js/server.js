import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { constructSmartContract, getMovieDetails, getUserTickets } from './tools.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static('src'));
app.use(cookieParser());

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Define the directory for static files
app.use(express.static(path.join(__dirname, 'public')));

let contract;

// Initialize contract
(async () => {
    try {
        console.log("Initializing contract...");
        contract = await constructSmartContract();
        console.log("Contract initialized successfully.");
    } catch (error) {
        console.error("Error initializing contract:", error);
    }
})();

// Routes
app.get('/', async (req, res) => {
    try {
        console.log("Fetching movie details and user tickets for home page...");
        const movieDetails = await getMovieDetails(contract, 0);
        const userTickets = await getUserTickets(contract, "USER_ADDRESS");
        console.log("Movie details and user tickets fetched successfully.");
        res.render('pages/index', { movieDetails, userTickets });
    } catch (error) {
        console.error("Error in GET / route:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/registration', (req, res) => {
    console.log("Rendering registration page...");
    res.render('pages/registration');
});

app.post('/registration', async (req, res) => {
    const addr = req.body.address;
    try {
        console.log(`Registering user with address: ${addr}`);
        let tx = await contract.registerUser(addr);
        console.log("Transaction successful:", tx);
        res.send(`<p id='accountAddress'>Successfully Registered: ${addr}</p>`);
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send('Registration Failed');
    }
});

app.get('/login', (req, res) => {
    console.log("Rendering login page...");
    res.render('pages/login');
});

app.post('/auth', async (req, res) => {
    const addr = req.body.address;
    try {
        console.log(`Authenticating user with address: ${addr}`);
        const isRegistered = await contract.getUser(addr);
        if (isRegistered) {
            console.log("User authenticated successfully.");
            res.cookie('addr', addr);
            res.redirect('/dashboard');
        } else {
            console.warn("User not registered.");
            res.status(401).send('Unauthorized');
        }
    } catch (err) {
        console.error("Error authenticating user:", err);
        res.status(500).send('Authentication Failed');
    }
});

app.get('/dashboard', async (req, res) => {
    const addr = req.cookies.addr;
    try {
        console.log(`Loading dashboard for user: ${addr}`);
        const userTickets = await getUserTickets(contract, addr);
        console.log("User tickets fetched successfully.");
        res.render('pages/dashboard', { addr, userTickets });
    } catch (err) {
        console.error("Error loading dashboard:", err);
        res.status(500).send('Failed to load dashboard');
    }
});

app.post('/buy-ticket', async (req, res) => {
    const { movieId, seatNumber, numTickets } = req.body;
    const addr = req.cookies.addr;
    try {
        console.log(`User ${addr} buying ticket(s) for movieId ${movieId} with seatNumber ${seatNumber} and numTickets ${numTickets}`);
        let tx = await contract.buyTicket(movieId, seatNumber, numTickets, { from: addr });
        console.log("Ticket purchase successful:", tx);
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error buying ticket:", err);
        res.status(500).send('Failed to buy ticket');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
