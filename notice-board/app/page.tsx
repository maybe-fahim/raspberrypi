"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [events, setEvents] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const sheetId = "1-0Pqqah-O3JoquzP-2z9373OrUhqpkr5bkQymdpG9yg";
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    const fetchSheet = () => {
      fetch(sheetUrl)
        .then((res) => res.text())
        .then((text) => {
          try {
            const json = JSON.parse(text.substr(47).slice(0, -2));
            if (!json.table || !json.table.rows || json.table.rows.length === 0) return;

            const rows = json.table.rows.map((r: any) =>
              r.c ? r.c.map((cell: any) => cell?.v || "") : []
            );

            const dateMap: { [key: number]: string } = {};

            // STRICT MAPPING: row x col → day
            const mapping: { [key: string]: number } = {
              "0_0": 1,  // A1
              "0_1": 2,  // B1
              "0_2": 3,  // C1
              "0_3": 4,  // D1
              "0_4": 5,  // E1
              "0_5": 6,  // F1
              "0_6": 7,  // G1
              "1_0": 8,  // A2
              "1_1": 9,  // B2
              "1_2": 10, // C2
              "1_3": 11, // D2
              "1_4": 12, // E2
              "1_5": 13, // F2
              "1_6": 14, // G2
              "2_0": 15, // A3
              "2_1": 16, // B3
              "2_2": 17, // C3
              "2_3": 18, // D3
              "2_4": 19, // E3
              "2_5": 20, // F3
              "2_6": 21, // G3
              "3_0": 22, // A4
              "3_1": 23, // B4
              "3_2": 24, // C4
              "3_3": 25, // D4
              "3_4": 26, // E4
              "3_5": 27, // F4
              "3_6": 28, // G4
              "4_0": 29, // A5
              "4_1": 30, // B5
              "4_2": 31, // C5
              // Add more if needed
            };

            for (let row = 0; row < rows.length; row++) {
              for (let col = 0; col < rows[row].length; col++) {
                const dayNumber = mapping[`${row}_${col}`];
                if (!dayNumber) continue; // skip unmapped cells
                const cellText = rows[row][col];
                if (cellText) dateMap[dayNumber] = cellText;
              }
            }

            setEvents(dateMap);
          } catch (err) {
            console.error("Failed to parse Google Sheets JSON:", err);
          }
        })
        .catch((err) => console.error("Error fetching Google Sheet:", err));
    };

    fetchSheet();
    const interval = setInterval(fetchSheet, 5000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday-first adjustment
  let startWeekday = firstDay.getDay();
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const totalRows = Math.ceil(calendarCells.length / 7);

  return (
    <div className="min-h-screen bg-gray-200 p-2 flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Monthly Calendar
      </h1>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
          <div
            key={idx}
            className="text-center font-bold p-2 bg-gray-300 text-gray-800 text-lg"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div
        className="grid gap-1 flex-grow"
        style={{
          gridTemplateRows: `repeat(${totalRows}, calc((100vh - 120px) / ${totalRows}))`,
        }}
      >
        {Array.from({ length: totalRows }).map((_, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7 gap-1">
            {calendarCells
              .slice(rowIdx * 7, rowIdx * 7 + 7)
              .map((day, idx) => {
                if (!day)
                  return <div key={idx} className="border w-full h-full"></div>;

                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();

                const weekday = idx % 7;
                let bgColor = "bg-white";
                if (isToday) bgColor = "bg-blue-200";
                else if (weekday === 5 || weekday === 6) bgColor = "bg-gray-100";

                return (
                  <div
                    key={idx}
                    className={`border flex flex-col w-full h-full p-2 ${bgColor} rounded`}
                  >
                    <div className="text-2xl font-bold text-gray-800">{day}</div>
                    <div className="text-lg mt-1 flex-1 overflow-y-auto break-words text-gray-800">
                      {events[day]}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
