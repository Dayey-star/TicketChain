// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract TicketChain {
    struct Movie {
        string title;
        uint256 totalSeats;
        uint256 totalTickets;
        uint256 ticketsSold;
    }

    struct Ticket {
        uint256 movieId;
        uint256 seatNumber;
        bool isValid;
        address user;
    }

    address public owner;
    uint256 public movieCount;
    uint256 public ticketsCount;
    mapping(uint256 => Movie) private movies; // Changed to private
    mapping(address => bool) public registeredUsers;
    mapping(address => uint256[]) private userTickets; // Changed to private
    mapping(uint256 => Ticket) private tickets; // Changed to private

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "You are not a registered user");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerUser() external {
        require(!registeredUsers[msg.sender], "User already registered");
        registeredUsers[msg.sender] = true;
    }

    function createMovie(string calldata _title, uint256 _totalSeats, uint256 _totalTickets) external onlyOwner {
        uint256 movieId = movieCount;
        movies[movieId] = Movie({
            title: _title,
            totalSeats: _totalSeats,
            totalTickets: _totalTickets,
            ticketsSold: 0
        });
        movieCount++;
    }

    function buyTicket(uint256 _movieId, uint256 _seatNumber, uint256 _numTickets) external onlyRegistered {
        require(_seatNumber <= movies[_movieId].totalSeats, "Invalid seat number");
        require(movies[_movieId].ticketsSold + _numTickets <= movies[_movieId].totalTickets, "Not enough tickets available");

        for (uint256 i = 0; i < _numTickets; i++) {
            uint256 ticketId = ticketsCount; // Get the next available ticket ID
            ticketsCount++;

            tickets[ticketId] = Ticket({
                movieId: _movieId,
                seatNumber: _seatNumber,
                isValid: true,
                user: msg.sender
            });

            // Add the ticket ID to the user's tickets
            userTickets[msg.sender].push(ticketId);

            // Increment tickets sold for the movie
            movies[_movieId].ticketsSold++;
        }
    }

    function transferTicket(uint256 _ticketId, address _to) external onlyRegistered {
        require(_to != address(0), "Invalid address");
        require(userTickets[msg.sender].length > 0, "No tickets available for transfer");

        bool ticketFound = false;
        for (uint256 i = 0; i < userTickets[msg.sender].length; i++) {
            if (userTickets[msg.sender][i] == _ticketId) {
                ticketFound = true;
                break;
            }
        }
        require(ticketFound, "Ticket does not belong to the sender");

        // Remove the ticket from the sender's ticket list
        uint256[] storage senderTickets = userTickets[msg.sender];
        for (uint256 i = 0; i < senderTickets.length; i++) {
            if (senderTickets[i] == _ticketId) {
                senderTickets[i] = senderTickets[senderTickets.length - 1];
                senderTickets.pop();
                break;
            }
        }

        // Add the ticket to the receiver's ticket list
        userTickets[_to].push(_ticketId);

        // Update the ticket's user
        tickets[_ticketId].user = _to;
    }

    function getMovieDetails(uint256 _movieId) external view returns (string memory title, uint256 totalSeats, uint256 totalTickets, uint256 ticketsSold) {
        Movie storage movie = movies[_movieId];
        return (movie.title, movie.totalSeats, movie.totalTickets, movie.ticketsSold);
    }

    // Add getter functions for the private mappings if necessary
    function getTicketDetails(uint256 _ticketId) external view returns (string memory movieTitle, uint256 movieId, uint256 seatNumber, address user) {
        Ticket storage ticket = tickets[_ticketId];
        Movie storage movie = movies[ticket.movieId];
        return (movie.title, ticket.movieId, ticket.seatNumber, ticket.user);
    }

    function getUserTickets(address _user) external view returns (uint256[] memory) {
        return userTickets[_user];
    }
}
