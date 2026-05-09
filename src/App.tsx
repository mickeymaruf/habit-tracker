import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

// Google Font "Gochi Hand" or "Indie Flower" is recommended for the CSS
const FONTS = "'Gochi Hand', cursive, sans-serif";

const COLORS = [
  '#AEC6CF',
  '#B39EB5',
  '#FFB7B2',
  '#FFDAC1',
  '#E2F0CB',
  '#B5EAD7',
  '#C7CEEA',
  '#FF9AA2',
  '#FFFFD8',
  '#E0BBE4',
];

const HabitTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState([
    { id: 1, name: 'HYDRATION', color: COLORS[0], entries: {} },
    { id: 2, name: 'EXERCISE', color: COLORS[1], entries: {} },
  ]);
  const [newHabitName, setNewHabitName] = useState('');

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const toggleDate = (habitId, dateStr) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const newEntries = { ...habit.entries };
          newEntries[dateStr] = !newEntries[dateStr];
          return { ...habit, entries: newEntries };
        }
        return habit;
      })
    );
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(),
      name: newHabitName.toUpperCase(),
      color: COLORS[habits.length % COLORS.length],
      entries: {},
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const removeHabit = (id) => setHabits(habits.filter((h) => h.id !== id));

  return (
    <div
      className="min-h-screen bg-[#f4f4f2] p-4 md:p-10"
      style={{
        fontFamily: FONTS,
        backgroundImage: `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`,
        backgroundSize: '25px 25px',
      }}
    >
      <div className="max-w-6xl mx-auto bg-white/60 p-8 shadow-xl border border-gray-200 rounded-sm relative">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-gray-800 border-b-2 border-black mb-2">
              HABIT TRACKER
            </h2>
          </div>
          <div className="flex flex-col items-center">
            <motion.h1
              key={currentDate.getMonth()}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-7xl font-bold text-gray-900 italic"
            >
              {format(currentDate, 'MMMM')}
            </motion.h1>
            <div className="flex gap-4 mt-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft />
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Tracker Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-48 text-left p-2 border-b-2 border-black"></th>
                {daysInMonth.map((day) => (
                  <th
                    key={day.toString()}
                    className="text-[10px] text-center border-l border-gray-300 w-8"
                  >
                    <div>{format(day, 'd')}</div>
                    <div className="text-gray-500 font-normal">
                      {format(day, 'eeeeee')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <motion.tr
                  layout
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group"
                >
                  <td className="p-2 border-b border-gray-300 relative group">
                    <div className="flex justify-between items-center pr-2">
                      <span className="text-lg font-bold truncate">
                        {habit.name}
                      </span>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                  {daysInMonth.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isActive = habit.entries[dateStr];
                    return (
                      <td
                        key={dateStr}
                        onClick={() => toggleDate(habit.id, dateStr)}
                        className="border border-gray-300 h-8 w-8 cursor-pointer relative overflow-hidden transition-colors hover:bg-gray-100"
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              className="absolute inset-0 m-1"
                              style={{
                                backgroundColor: habit.color,
                                // Sketchy "cross-hatch" effect
                                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`,
                              }}
                            />
                          )}
                        </AnimatePresence>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Habit */}
        <form onSubmit={addHabit} className="mt-8 flex gap-2 max-w-sm">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="ADD NEW HABIT..."
            className="flex-1 bg-transparent border-b-2 border-gray-400 focus:border-black outline-none px-2 py-1 text-lg"
          />
          <button
            type="submit"
            className="p-1 border-2 border-black hover:bg-black hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HabitTracker;
