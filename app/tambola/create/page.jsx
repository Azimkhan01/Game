"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import QRCode from "react-qr-code";

function Page() {
  const [uuid, setUuid] = useState("");
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [remainingNumbers, setRemainingNumbers] = useState([]);
  const [winners, setWinners] = useState({});
  const [manualWinners, setManualWinners] = useState({});

  // Updated for 1–90 Tambola
  const winnerPatterns = {
    firstFive: (numbers) => (numbers.length >= 5 ? numbers.slice(0, 5) : null),

    // You can adjust these ranges based on your own custom logic
    firstLine: (numbers) =>
      numbers.filter((n) => n >= 1 && n <= 30).length === 30
        ? numbers.filter((n) => n >= 1 && n <= 30)
        : null,

    middleLine: (numbers) =>
      numbers.filter((n) => n >= 31 && n <= 60).length === 30
        ? numbers.filter((n) => n >= 31 && n <= 60)
        : null,

    lastLine: (numbers) =>
      numbers.filter((n) => n >= 61 && n <= 90).length === 30
        ? numbers.filter((n) => n >= 61 && n <= 90)
        : null,

    fullHouse: (numbers) => (numbers.length === 90 ? [...numbers] : null),
  };

  // Load from localStorage
  useEffect(() => {
    const savedUuid = localStorage.getItem("uuid");
    const savedNumbers = JSON.parse(
      localStorage.getItem("generatedNumbers") || "[]"
    );
    const savedWinners = JSON.parse(localStorage.getItem("winners") || "{}");

    if (savedUuid) {
      setUuid(savedUuid);
      setGeneratedNumbers(savedNumbers);
      setRemainingNumbers(
        Array.from({ length: 90 }, (_, i) => i + 1).filter(
          (num) => !savedNumbers.includes(num)
        )
      );
      setWinners(savedWinners);
      setManualWinners(savedWinners);
    } else {
      createNew();
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (uuid) {
      localStorage.setItem("uuid", uuid);
      localStorage.setItem(
        "generatedNumbers",
        JSON.stringify(generatedNumbers)
      );
      localStorage.setItem("winners", JSON.stringify(manualWinners));
    }
  }, [generatedNumbers, manualWinners, uuid]);

  const createNew = () => {
    const newUuid = uuidv4();
    setUuid(newUuid);
    setGeneratedNumbers([]);
    setRemainingNumbers(Array.from({ length: 90 }, (_, i) => i + 1));
    setWinners({});
    setManualWinners({});
    localStorage.setItem("uuid", newUuid);
    localStorage.setItem("generatedNumbers", JSON.stringify([]));
    localStorage.setItem("winners", JSON.stringify({}));
  };

  const generateNumber = () => {
    if (remainingNumbers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
    const number = remainingNumbers[randomIndex];
    const newNumbers = [...generatedNumbers, number];
    setGeneratedNumbers(newNumbers);
    setRemainingNumbers((prev) => prev.filter((_, i) => i !== randomIndex));
    checkWinners(newNumbers);
  };

  const checkWinners = (numbers) => {
    const updatedWinners = { ...manualWinners };

    for (const [key, fn] of Object.entries(winnerPatterns)) {
      if (!updatedWinners[key]) {
        const result = fn(numbers);
        if (result) updatedWinners[key] = result;
      }
    }

    setWinners(updatedWinners);
    setManualWinners(updatedWinners);
  };

  const handleManualWinnerChange = (key, value) => {
    setManualWinners((prev) => ({
      ...prev,
      [key]: value
        .split(",")
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v)),
    }));
  };

  const qrData = JSON.stringify({
    uuid,
    generatedNumbers,
    winners: manualWinners,
  });

  const isWinnerNumber = (num) => {
    return Object.values(manualWinners).some((arr) => arr.includes(num));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
        UUID: {uuid}
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Button
          onClick={generateNumber}
          className="bg-gray-700 text-white hover:bg-gray-600 flex-1"
          disabled={remainingNumbers.length === 0}
        >
          Generate Random Number
        </Button>
        <Button
          onClick={createNew}
          className="bg-red-600 text-white hover:bg-red-500 flex-1"
        >
          Create New
        </Button>
      </div>

      <Card className="w-full max-w-3xl mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">Numbers Grid</CardTitle>
          <div className="mt-2 text-center text-lg">
            <p className="text-purple-700 text-5xl font-bold">
              {generatedNumbers.length > 0
                ? `${generatedNumbers[generatedNumbers.length - 1]}`
                : ""}
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-10 gap-2 p-4">
          {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
            const isGenerated = generatedNumbers.includes(num);
            const isWinner = isWinnerNumber(num);
            return (
              <div
                key={num}
                className={`w-full aspect-square flex items-center justify-center rounded-md font-bold
                  ${
                    isWinner
                      ? "bg-yellow-400 text-gray-900"
                      : isGenerated
                      ? "bg-green-500 text-gray-900"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
              >
                {num}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">Winners</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {Object.keys(winnerPatterns).map((key) => (
            <div
              key={key}
              className="flex flex-col gap-1 bg-gray-700 p-2 rounded"
            >
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <input
                type="text"
                placeholder="Enter winning numbers comma separated"
                onChange={(e) => handleManualWinnerChange(key, e.target.value)}
                className="w-full p-1 rounded text-black"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-4 bg-gray-900">
          <QRCode value={qrData} size={200} bgColor="#1f2937" fgColor="#ffffff" />
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;