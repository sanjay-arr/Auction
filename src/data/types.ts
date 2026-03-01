export interface User {
  id: string;
  name: string;
  email: string;
  // added admin as possible role
  role: "buyer" | "seller" | "admin";
}

export type AuctionStatus = "pending" | "upcoming" | "live" | "ended";

export interface Auction {
  id: string;
  itemName: string;
  description: string;
  basePrice: number;
  currentBid: number;
  highestBidder: string | null;
  // expanded status union to include pending
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  sellerId: string;
  bidCount: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderName: string;
  amount: number;
  time: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
