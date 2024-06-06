import { ethers } from "ethers";
import contractABI from "./src/contractABI.json" assert { type: "json" };
import contractAddress from "./src/contract-address.json" assert { type: "json" };

// Ethereum provider
const provider = new ethers.JsonRpcProvider("http://localhost:3000");

// Function to construct the smart contract instance
export async function constructSmartContract() {
    const signer = provider.getSigner(0);
    return new ethers.Contract(contractAddress.TicketChain, contractABI.abi, signer);
}

// Function to get movie details
export async function getMovieDetails(contract, movieId) {
    try {
        const movieDetails = await contract.getMovieDetails(movieId);
        return movieDetails;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
}

// Function to get user tickets
export async function getUserTickets(contract, userAddress) {
    try {
        const userTickets = await contract.getUserTickets(userAddress);
        return userTickets;
    } catch (error) {
        console.error("Error fetching user tickets:", error);
        return null;
    }
}
