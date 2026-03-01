import { Auction, Bid, User } from "./types";

export const mockUsers: User[] = [
  // provide one admin user for demonstration
  { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: "2", name: "Priya Patel", email: "priya@example.com", role: "seller" },
  { id: "3", name: "Amit Kumar", email: "amit@example.com", role: "buyer" },
  { id: "4", name: "Sneha Gupta", email: "sneha@example.com", role: "buyer" },
];

const now = Date.now();
const HOUR = 3600000;

// start with an empty list; auctions are created by sellers
export const mockAuctions: Auction[] = [];

// no initial bids; bids will be created during auctions
export const mockBids: Bid[] = [];
