// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarPage.css"; // We'll create this for custom styling

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      const expensesData = res.data.data || [];
      setExpenses(expensesData);

      // Convert expenses to calendar events
      const calendarEvents = expensesData.map((expense) => ({
        id: expense._id,
        title: `${expense.title} - $${expense.amount.toFixed(2)}`,
        start: new Date(expense.date),
        end: new Date(expense.date),
        resource: expense,
      }));

      setEvents(calendarEvents);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const eventStyleGetter = (event) => {
    const expense = event.resource;
    let backgroundColor = "#10b981"; // Default green

    // Color code by amount
    if (expense.amount > 100) {
      backgroundColor = "#ef4444"; // Red for large expenses
    } else if (expense.amount > 50) {
      backgroundColor = "#f59e0b"; // Orange for medium
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0",
        display: "block",
      },
    };
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading calendar…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400 mb-1">
          Expense Calendar
        </h1>
        <p className="text-gray-400">
          View your expenses on a calendar 📅
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow" style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: "100%" }}
        />
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="bg-gray-800/60 rounded-lg p-6 shadow">
          <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
            Expense Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Title</p>
              <p className="text-gray-100 font-semibold">{selectedEvent.title}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-red-400 font-semibold text-xl">
                ${selectedEvent.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Category</p>
              <p className="text-gray-100">{selectedEvent.category}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p className="text-gray-100">
                {new Date(selectedEvent.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}