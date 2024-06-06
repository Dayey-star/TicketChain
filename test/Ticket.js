const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketChain", function () {
  let TicketChain;
  let ticketChain;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    TicketChain = await ethers.getContractFactory("TicketChain");
    ticketChain = await TicketChain.deploy();
    await ticketChain.deployed();
  });

  it("should allow owner to create a movie", async function () {
    await ticketChain.createMovie("Inception", 100, 50);
    const movie = await ticketChain.getMovieDetails(0);
    expect(movie.title).to.equal("Inception");
    expect(movie.totalSeats).to.equal(100);
    expect(movie.totalTickets).to.equal(50);
    expect(movie.ticketsSold).to.equal(0);
  });

  it("should allow user to register", async function () {
    await ticketChain.connect(user1).registerUser();
    const isRegistered = await ticketChain.registeredUsers(user1.address);
    expect(isRegistered).to.be.true;
  });

  it("should allow registered user to buy tickets", async function () {
    await ticketChain.createMovie("Inception", 100, 50);
    await ticketChain.connect(user1).registerUser();
    await ticketChain.connect(user1).buyTicket(0, 1, 2);

    const movie = await ticketChain.getMovieDetails(0);
    expect(movie.ticketsSold).to.equal(2);

    const userTickets = await ticketChain.getUserTickets(user1.address);
    expect(userTickets.length).to.equal(2);
  });

  it("should allow registered user to transfer tickets", async function () {
    await ticketChain.createMovie("Inception", 100, 50);
    await ticketChain.connect(user1).registerUser();
    await ticketChain.connect(user1).buyTicket(0, 1, 1);

    const user1TicketsBefore = await ticketChain.getUserTickets(user1.address);
    expect(user1TicketsBefore.length).to.equal(1);

    await ticketChain.connect(user2).registerUser();
    await ticketChain.connect(user1).transferTicket(user1TicketsBefore[0], user2.address);

    const user1TicketsAfter = await ticketChain.getUserTickets(user1.address);
    const user2TicketsAfter = await ticketChain.getUserTickets(user2.address);
    expect(user1TicketsAfter.length).to.equal(0);
    expect(user2TicketsAfter.length).to.equal(1);
  });

  it("should return correct ticket details including movie title", async function () {
    await ticketChain.createMovie("Inception", 100, 50);
    await ticketChain.connect(user1).registerUser();
    await ticketChain.connect(user1).buyTicket(0, 1, 1);

    const userTickets = await ticketChain.getUserTickets(user1.address);
    const ticketDetails = await ticketChain.getTicketDetails(userTickets[0]);

    expect(ticketDetails.movieTitle).to.equal("Inception");
    expect(ticketDetails.movieId).to.equal(0);
    expect(ticketDetails.seatNumber).to.equal(1);
    expect(ticketDetails.user).to.equal(user1.address);
  });
});
