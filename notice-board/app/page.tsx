"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [events, setEvents] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const sheetId = "1-0Pqqah-O3JoquzP-2z9373OrUhqpkr5bkQymdpG9yg";
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    fetch(sheetUrl)
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text.substr(47).slice(0, -2));
        if (!json.table || !json.table.rows || json.table.rows.length === 0) return;

        const rows = json.table.rows.map((r: any) =>
          r.c ? r.c.map((cell: any) => cell?.v || "") : []
        );

        const dateMap: { [key: number]: string } = {};
        let counter = 1;

        for (let col = 0; col < rows[0].length; col++) {
          for (let row = 0; row < rows.length; row++) {
            const cellText = rows[row][col];
            if (cellText) dateMap[counter] = cellText;
            counter++;
          }
        }
        setEvents(dateMap);
      })
      .catch((err) => console.error(err));
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday-first adjustment
  let startWeekday = firstDay.getDay(); // Sunday = 0
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="min-h-screen bg-gray-200 p-2 flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Monthly Calendar
      </h1>

      {/* Calendar grid container */}
      <div className="grid grid-rows-[auto_1fr] flex-grow w-full">
        {/* Weekday headers: fixed height */}
        <div className="grid grid-cols-7 gap-1">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, idx) => (
            <div
              key={idx}
              className="text-center font-bold p-2 bg-gray-300 text-gray-800 text-lg"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar day cells: grow to fill remaining space */}
        <div className="grid grid-cols-7 gap-1 flex-grow">
          {calendarCells.map((day, idx) => {
            if (!day) return <div key={idx} className="p-2 border h-full w-full"></div>;

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
                className={`p-2 border flex flex-col w-full h-full ${bgColor} rounded`}
              >
                <div className="text-2xl font-bold text-gray-800">{day}</div>
                <div className="text-lg mt-1 flex-1 overflow-y-auto break-words text-gray-800">
                  {events[day]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
