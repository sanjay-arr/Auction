import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Auction, Bid } from "@/data/types";
import { mockAuctions, mockBids } from "@/data/mockData";

interface AuctionContextType {
    auctions: Auction[];
    bids: Bid[];
    placeBid: (auctionId: string, amount: number, bidderName: string) => void;
    createAuction: (auction: Auction) => void;
    approveAuction: (auctionId: string) => void;
    startAuction: (auctionId: string) => void;
    endAuction: (auctionId: string) => void;
    removeAuction: (auctionId: string) => void; // admin only
}

const AuctionContext = createContext<AuctionContextType | null>(null);

export const useAuction = () => {
    const ctx = useContext(AuctionContext);
    if (!ctx) throw new Error("useAuction must be used within AuctionProvider");
    return ctx;
};

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [auctions, setAuctions] = useState<Auction[]>(() => {
        try {
            const raw = localStorage.getItem("auctions");
            return raw ? JSON.parse(raw) as Auction[] : mockAuctions;
        } catch {
            return mockAuctions;
        }
    });
    const [bids, setBids] = useState<Bid[]>(() => {
        try {
            const raw = localStorage.getItem("bids");
            return raw ? JSON.parse(raw) as Bid[] : mockBids;
        } catch {
            return mockBids;
        }
    });
    const bcRef = useRef<BroadcastChannel | null>(null);

    // Periodically check and update auction status based on time (but skip pending and only auto-end live auctions)
    useEffect(() => {
        const interval = setInterval(() => {
            setAuctions((prevAuctions) =>
                prevAuctions.map((auction) => {
                    // pending auctions are not driven by clock
                    if (auction.status === "pending") return auction;
                    
                    // Only auto-transition LIVE auctions to ENDED when endTime is reached
                    // DO NOT auto-transition upcoming to live (admin must manually click Start)
                    if (auction.status === "live") {
                        const now = Date.now();
                        const endTime = new Date(auction.endTime).getTime();
                        if (now >= endTime) {
                            return { ...auction, status: "ended" };
                        }
                    }
                    
                    return auction;
                })
            );
        }, 10000); // Check every 10 secs

        return () => clearInterval(interval);
    }, []);

    // setup BroadcastChannel / storage sync for multi-tab / multi-user demo
    useEffect(() => {
        if (typeof window === "undefined") return;

        const onMessage = (msg: any) => {
            const { type, payload } = msg?.data || msg || {};
            if (!type) return;

            if (type === "placeBid") {
                const bid: Bid = payload;
                setBids((prev) => [bid, ...prev]);
                setAuctions((prev) => prev.map((a) => a.id === bid.auctionId ? { ...a, currentBid: bid.amount, highestBidder: bid.bidderName, bidCount: (a.bidCount || 0) + 1 } : a));
            }
            if (type === "createAuction") {
                const auction: Auction = payload;
                setAuctions((prev) => [auction, ...prev]);
            }
            if (type === "approve") {
                const id: string = payload;
                setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: "upcoming" } : a));
            }
            if (type === "start") {
                const id: string = payload;
                setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: "live", startTime: new Date().toISOString() } : a));
            }
            if (type === "end") {
                const id: string = payload;
                setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: "ended", endTime: new Date().toISOString() } : a));
            }
            if (type === "remove") {
                const id: string = payload;
                setAuctions((prev) => prev.filter((a) => a.id !== id));
                // also remove related bids
                setBids((prev) => prev.filter((b) => b.auctionId !== id));
            }
        };

        // BroadcastChannel if available
        try {
            if ((window as any).BroadcastChannel) {
                const bc = new BroadcastChannel("auction_channel");
                bc.onmessage = onMessage;
                bcRef.current = bc;
            }
        } catch (e) {
            bcRef.current = null;
        }

        // fallback: listen to storage events
        const handleStorage = (ev: StorageEvent) => {
            if (!ev.key) return;
            if (ev.key === "auctions") {
                try { const newA = JSON.parse(ev.newValue || "[]"); setAuctions(newA); } catch {}
            }
            if (ev.key === "bids") {
                try { const newB = JSON.parse(ev.newValue || "[]"); setBids(newB); } catch {}
            }
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
            if (bcRef.current) {
                try { bcRef.current.close(); } catch {}
                bcRef.current = null;
            }
        };
    }, []);

    const placeBid = (auctionId: string, amount: number, bidderName: string) => {
        const newBid: Bid = {
            id: Date.now().toString(),
            auctionId,
            bidderName,
            amount,
            time: new Date().toISOString(),
        };

        setBids((prev) => [newBid, ...prev]);

        setAuctions((prev) =>
            prev.map((a) => {
                if (a.id === auctionId) {
                    return {
                        ...a,
                        currentBid: amount,
                        highestBidder: bidderName,
                        bidCount: a.bidCount + 1,
                    };
                }
                return a;
            })
        );
        // persist and broadcast
        try { localStorage.setItem("bids", JSON.stringify([newBid, ...bids])); } catch {}
        try { localStorage.setItem("auctions", JSON.stringify(auctions.map((a) => a.id === auctionId ? { ...a, currentBid: amount, highestBidder: bidderName, bidCount: a.bidCount + 1 } : a))); } catch {}
        try { bcRef.current?.postMessage({ type: "placeBid", payload: newBid }); } catch {}
    };

    const createAuction = (auction: Auction) => {
        // new auctions from sellers start in pending state
        const payload = { ...auction, status: "pending" as Auction["status"] };
        setAuctions((prev) => [payload, ...prev]);
        try { const next = [payload, ...auctions]; localStorage.setItem("auctions", JSON.stringify(next)); } catch {}
        try { bcRef.current?.postMessage({ type: "createAuction", payload }); } catch {}
    };

    const approveAuction = (auctionId: string) => {
        setAuctions((prev) =>
            prev.map((a) => (a.id === auctionId ? { ...a, status: "upcoming" } : a))
        );
        try { const next = auctions.map((a) => a.id === auctionId ? { ...a, status: "upcoming" } : a); localStorage.setItem("auctions", JSON.stringify(next)); } catch {}
        try { bcRef.current?.postMessage({ type: "approve", payload: auctionId }); } catch {}
    };

    const startAuction = (auctionId: string) => {
        setAuctions((prev) =>
            prev.map((a) =>
                a.id === auctionId
                    ? { ...a, status: "live", startTime: new Date().toISOString() }
                    : a
            )
        );
        try { const next = auctions.map((a) => a.id === auctionId ? { ...a, status: "live", startTime: new Date().toISOString() } : a); localStorage.setItem("auctions", JSON.stringify(next)); } catch {}
        try { bcRef.current?.postMessage({ type: "start", payload: auctionId }); } catch {}
    };

    const endAuction = (auctionId: string) => {
        setAuctions((prev) =>
            prev.map((a) =>
                a.id === auctionId
                    ? { ...a, status: "ended", endTime: new Date().toISOString() }
                    : a
            )
        );
        try { const next = auctions.map((a) => a.id === auctionId ? { ...a, status: "ended", endTime: new Date().toISOString() } : a); localStorage.setItem("auctions", JSON.stringify(next)); } catch {}
        try { bcRef.current?.postMessage({ type: "end", payload: auctionId }); } catch {}
    };

    const removeAuction = (auctionId: string) => {
        setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
        setBids((prev) => prev.filter((b) => b.auctionId !== auctionId));
        try { const next = auctions.filter((a) => a.id !== auctionId); localStorage.setItem("auctions", JSON.stringify(next)); } catch {}
        try { const nextB = bids.filter((b) => b.auctionId !== auctionId); localStorage.setItem("bids", JSON.stringify(nextB)); } catch {}
        try { bcRef.current?.postMessage({ type: "remove", payload: auctionId }); } catch {}
    };

    return (
        <AuctionContext.Provider value={{ auctions, bids, placeBid, createAuction, approveAuction, startAuction, endAuction, removeAuction }}>
            {children}
        </AuctionContext.Provider>
    );
};
