"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export default function Page() {
  const [ticket, setTicket] = useState([]);
  const [ticketId, setTicketId] = useState("");
  const [clickedNumbers, setClickedNumbers] = useState({});
  const [status, setStatus] = useState({
    firstFive: false,
    topLine: false,
    middleLine: false,
    bottomLine: false,
    fullHouse: false,
  });
  const [showSaved, setShowSaved] = useState(false);
  const [savedTickets, setSavedTickets] = useState([]);
  const [ticketName, setTicketName] = useState("");

  const previousStatus = useRef({ ...status });

  useEffect(() => {
    const storedClicked = localStorage.getItem("clickedNumbers");
    if (storedClicked) setClickedNumbers(JSON.parse(storedClicked));
    loadSavedTickets();
  }, []);

  useEffect(() => {
    localStorage.setItem("clickedNumbers", JSON.stringify(clickedNumbers));
    checkWinningConditions();
  }, [clickedNumbers]);

  // Load saved tickets
  const loadSavedTickets = () => {
    const saved = JSON.parse(localStorage.getItem("savedTickets") || "[]");
    setSavedTickets(saved);
  };

  // Generate Ticket
  const generateTicket = () => {
    const newTicket = Array.from({ length: 3 }, () => Array(9).fill(null));
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    
for (let row = 0; row < 3; row++) {
  const chosenCols = new Set();
  while (chosenCols.size < 5) chosenCols.add(Math.floor(Math.random() * 9));

  chosenCols.forEach((col) => {
    const min = col * 10 + 1;
    const max = col === 8 ? 90 : col * 10 + 10;

    const possibleNumbers = allNumbers.filter(
      (num) => num >= min && num <= max
    );

    const num =
      possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];

    newTicket[row][col] = num;
    allNumbers.splice(allNumbers.indexOf(num), 1);
  });
}

setTicket(newTicket);
const id = uuidv4();
setTicketId(id);
setClickedNumbers({});
setStatus({
  firstFive: false,
  topLine: false,
  middleLine: false,
  bottomLine: false,
  fullHouse: false,
});
previousStatus.current = {
  firstFive: false,
  topLine: false,
  middleLine: false,
  bottomLine: false,
  fullHouse: false,
};
toast.success("New ticket generated!");
;
  };

  // Toggle Number
  const toggleNumber = (num) => {
    if (!num) return;
    setClickedNumbers((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  // Winning Conditions
  const checkWinningConditions = () => {
    if (ticket.length === 0) return;

    
const allNums = ticket.flat().filter(Boolean);
const clickedCount = allNums.filter((n) => clickedNumbers[n]).length;

const newStatus = {
  firstFive: clickedCount >= 5,
  topLine: ticket[0].filter(Boolean).every((n) => clickedNumbers[n]),
  middleLine: ticket[1].filter(Boolean).every((n) => clickedNumbers[n]),
  bottomLine: ticket[2].filter(Boolean).every((n) => clickedNumbers[n]),
  fullHouse: clickedCount === 15,
};

Object.keys(newStatus).forEach((key) => {
  if (!previousStatus.current[key] && newStatus[key]) {
    toast.success(
      key === "firstFive"
        ? "⭐ First Five Completed!"
        : key === "topLine"
        ? "⭐ Top Line Completed!"
        : key === "middleLine"
        ? "⭐ Middle Line Completed!"
        : key === "bottomLine"
        ? "⭐ Bottom Line Completed!"
        : "🎉 FULL HOUSE Completed!"
    );
  }
});

previousStatus.current = newStatus;
setStatus(newStatus);
;
  };

  // Save ticket
  const saveTicket = () => {
    if (!ticketId || ticket.length === 0) {
      toast.error("No ticket to save!");
      return;
    }
    if (!ticketName) {
      toast.error("Please enter a name for the ticket!");
      return;
    }

    
const saved = JSON.parse(localStorage.getItem("savedTickets") || "[]");
saved.push({
  id: ticketId,
  name: ticketName,
  ticket,
  clickedNumbers,
});

localStorage.setItem("savedTickets", JSON.stringify(saved));
setSavedTickets(saved);
toast.success("Ticket saved!");
setTicketName("");

  };

  // Load saved ticket
  const loadSavedTicket = (saved) => {
    setTicket(saved.ticket);
    setTicketId(saved.id);
    setClickedNumbers(saved.clickedNumbers);
    setTicketName(saved.name);
    toast.success(`Loaded ticket "${saved.name}"`);
  };

  // Delete saved ticket
  const deleteSavedTicket = (id) => {
    const filtered = savedTickets.filter((t) => t.id !== id);
    localStorage.setItem("savedTickets", JSON.stringify(filtered));
    setSavedTickets(filtered);
    toast.success("Ticket deleted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {" "}
      <h1 className="text-4xl font-semibold text-gray-800 mb-6 text-center">
        Tambola Ticket{" "}
      </h1>
      
      <div className="flex gap-3 mb-6">
        <button
          onClick={generateTicket}
          className="px-6 py-3 rounded bg-gray-900 text-white font-medium shadow hover:bg-black"
        >
          Create New Ticket
        </button>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="px-6 py-3 rounded bg-blue-600 text-white font-medium shadow hover:bg-blue-700"
        >
          {showSaved ? "Hide Saved Tickets" : "Show Saved Tickets"}
        </button>
      </div>
      {showSaved && (
        <div className="w-full max-w-lg mb-6">
          {savedTickets.length === 0 && (
            <p className="text-center text-gray-500">No saved tickets</p>
          )}
          {savedTickets.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center mb-2 p-2 bg-white rounded shadow border"
            >
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-gray-500">{t.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadSavedTicket(t)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteSavedTicket(t.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {ticket.length > 0 && (
        <div className="w-full max-w-lg mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter ticket name"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={saveTicket}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Ticket
            </button>
          </div>
        </div>
      )}
      {/* Ticket */}
      {ticket.length > 0 && (
        <section className="bg-white border border-gray-300 rounded-xl p-5 w-full max-w-lg shadow mb-6">
          <h2 className="text-center font-medium text-lg mb-4">
            Ticket ID: {ticketId}
          </h2>

          <div className="grid grid-cols-9 gap-2">
            {ticket.flat().map((num, idx) => (
              <div
                key={idx}
                onClick={() => toggleNumber(num)}
                className={`w-full aspect-square flex items-center justify-center rounded-lg text-sm font-semibold cursor-pointer transition
              ${
                clickedNumbers[num]
                  ? "bg-green-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-900"
              }
              ${!num && "bg-transparent cursor-default"}
            `}
              >
                {num || ""}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* QR Section */}
      {ticket.length > 0 && (
        <section className="bg-white border border-gray-300 rounded-xl p-5 w-full max-w-lg shadow mb-6 text-center">
          <h2 className="font-medium text-lg mb-4">Ticket QR</h2>
          <div className="flex justify-center p-4 bg-gray-50 rounded">
            <QRCode
              value={JSON.stringify({
                id: ticketId,
                name: ticketName || "Unnamed Ticket",
                ticket,
              })}
              size={200}
            />
          </div>
        </section>
      )}
      {/* Winning Status */}
      <section className="bg-white border border-gray-300 rounded-xl p-5 w-full max-w-lg shadow mb-10">
        <h2 className="text-center font-medium text-lg mb-4">Winning Status</h2>

        <div className="space-y-2 text-lg text-center">
          <p className={status.firstFive ? "text-green-600" : "text-gray-500"}>
            ⭐ First Five
          </p>
          <p className={status.topLine ? "text-green-600" : "text-gray-500"}>
            ⭐ Top Line
          </p>
          <p className={status.middleLine ? "text-green-600" : "text-gray-500"}>
            ⭐ Middle Line
          </p>
          <p className={status.bottomLine ? "text-green-600" : "text-gray-500"}>
            ⭐ Bottom Line
          </p>
          <p
            className={
              status.fullHouse
                ? "text-green-600 text-xl"
                : "text-gray-500 text-xl"
            }
          >
            🎉 FULL HOUSE
          </p>
        </div>
      </section>
    </div>
  );
}
