import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, LayoutGrid, List, X, Check } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import './App.css';

const COLORS = [
  '#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500',
  '#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'
];

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('list');
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [newHabitName, setNewHabitName] = useState('');
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deletingHabitId, setDeletingHabitId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const calendarGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const toggleDay = (habitId, dateKey) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = { ...habit.completed };
        if (newCompleted[dateKey]) delete newCompleted[dateKey];
        else newCompleted[dateKey] = true;
        return { ...habit, completed: newCompleted };
      }
      return habit;
    }));
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      color: COLORS[habits.length % COLORS.length],
      completed: {}
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const startEditing = (habit) => {
    setEditingHabitId(habit.id);
    setEditValue(habit.name);
  };

  const saveEdit = (id) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name: editValue } : h));
    setEditingHabitId(null);
  };

  const handleDelete = (id) => {
    if (deleteConfirmation.toLowerCase() === 'delete') {
      setHabits(habits.filter(h => h.id !== id));
      setDeletingHabitId(null);
      setDeleteConfirmation('');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] p-4 md:p-8 font-['Architects_Daughter'] text-slate-800">
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: `radial-gradient(#000 0.5px, transparent 0.5px)`, backgroundSize: '20px 20px' }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Header Section */}
        <header className="flex justify-between items-end mb-8 border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-4xl md:text-6xl tracking-tighter">
              {format(currentDate, 'MMMM')} <span className="text-[26px]">{format(currentDate, 'yyyy')}</span>
            </h1>
            <p className="text-xl tracking-widest mt-2 font-bold">HABIT TRACKER</p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1 mr-4 border-2 border-slate-900 p-1 rounded-md bg-white/50 relative">
              <button
                onClick={() => setView('list')}
                className={`p-1.5 transition-all relative z-10 ${view === 'list' ? 'text-white' : 'text-slate-600'}`}
              >
                {view === 'list' && (
                  <div className="absolute inset-0 bg-slate-900 rounded-sm -z-10 css-tab-active" />
                )}
                <List size={18} strokeWidth={2.5} />
              </button>

              <button
                onClick={() => setView('grid')}
                className={`p-1.5 transition-all relative z-10 ${view === 'grid' ? 'text-white' : 'text-slate-600'}`}
              >
                {view === 'grid' && (
                  <div className="absolute inset-0 bg-slate-900 rounded-sm -z-10 css-tab-active" />
                )}
                <LayoutGrid size={18} strokeWidth={2.5} />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-sm font-bold border-2 border-slate-900 px-3 py-1 rounded-full hover:bg-slate-900 hover:text-white transition-colors"
            >
              TODAY
            </button>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:scale-110 transition-transform">
              <ChevronLeft size={32} />
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="hover:scale-110 transition-transform">
              <ChevronRight size={32} />
            </button>
          </div>
        </header>

        {view === 'list' ? (
          /* Tracker Grid (Original View) */
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              {/* Calendar Header Row */}
              <div className="flex">
                <div className="w-48 shrink-0" />
                <div className="flex flex-1">
                  {daysInMonth.map(day => {
                    const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    return (
                      <div key={day.toString()} className={`w-8 text-center text-xs border-l border-slate-300 ${isToday ? 'bg-orange-100/40' : ''}`}>
                        <div className="font-bold">{format(day, 'd')}</div>
                        <div className="opacity-60">{format(day, 'eeeeee')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Habit Rows */}
              <div className="habit-list-container">
                {habits.length === 0 ? (
                  <div className="py-8 text-center opacity-50 border-t border-slate-900">
                    No habits added yet. Start by adding one below!
                  </div>
                ) : (
                  habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex border-t border-slate-900 group habit-row-entry"
                    >
                      {/* Habit Name Cell */}
                      <div className="w-48 shrink-0 py-2 pr-4 flex justify-between items-center border-r-2 border-slate-900 relative">
                        {editingHabitId === habit.id ? (
                          <div className="flex items-center gap-1 w-full">
                            <input
                              autoFocus
                              className="bg-transparent border-b border-slate-900 outline-none w-full font-bold"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(habit.id)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(habit.id)}
                            />
                          </div>
                        ) : (
                          <span 
                            className="truncate font-bold tracking-wide"
                            onClick={() => startEditing(habit)}
                            title={habit.name}
                          >
                            {habit.name}
                          </span>
                        )}
                        
                        <div className="flex items-center ml-2">
                          {deletingHabitId === habit.id ? (
                            <div className="absolute left-0 top-0 bottom-0 right-0 bg-[#fcfaf2] z-20 flex items-center px-2 gap-2">
                              <input 
                                autoFocus
                                placeholder='Type "delete"' 
                                className="font-sans text-sm border-b border-red-400 bg-transparent outline-none w-full"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDelete(habit.id)}
                              />
                              <button onClick={() => handleDelete(habit.id)} className="text-red-600"><Check size={14}/></button>
                              <button onClick={() => {setDeletingHabitId(null); setDeleteConfirmation('');}} className="text-slate-400"><X size={14}/></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingHabitId(habit.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Days Grid Cells */}
                      <div className="flex flex-1">
                        {daysInMonth.map(day => {
                          const dateKey = format(day, 'yyyy-MM-dd');
                          const isChecked = habit.completed[dateKey];
                          const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
                          return (
                            <div
                              key={dateKey}
                              onClick={() => toggleDay(habit.id, dateKey)}
                              className={`w-8 h-10 border-r border-b border-slate-300 cursor-pointer relative overflow-hidden ${isToday ? 'bg-orange-100/40' : ''}`}
                            >
                              {isChecked && (
                                <div
                                  className="absolute inset-0 m-1 css-mark-check"
                                  style={{
                                    backgroundColor: habit.color,
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`,
                                    borderRadius: '2px'
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid View (2nd View - Based on Image) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex flex-col items-center habit-row-entry"
              >
                <div className="w-full flex justify-between items-center mb-4 group relative">
                  <div className="flex-1 ml-6 text-center">
                    {editingHabitId === habit.id ? (
                      <input
                        autoFocus
                        className="bg-transparent border-b border-slate-900 outline-none font-bold tracking-[2px] uppercase text-center w-full"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(habit.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(habit.id)}
                      />
                    ) : (
                      <h3 
                        className="text-lg font-bold tracking-[2px] uppercase"
                        onClick={() => startEditing(habit)}
                      >
                        {habit.name}
                      </h3>
                    )}
                  </div>
                  
                  {deletingHabitId === habit.id ? (
                    <div className="absolute inset-0 bg-[#fcfaf2] z-20 flex items-center justify-center gap-2 px-4">
                      <input 
                        autoFocus
                        placeholder='Type "delete"' 
                        className="font-sans text-sm border-b border-red-400 bg-transparent outline-none w-full text-center"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDelete(habit.id)}
                      />
                      <button onClick={() => handleDelete(habit.id)} className="text-red-600"><Check size={18}/></button>
                      <button onClick={() => {setDeletingHabitId(null); setDeleteConfirmation('');}} className="text-slate-400"><X size={18}/></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingHabitId(habit.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-7 gap-x-4 gap-y-2 text-center relative">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-sm font-bold opacity-80 mb-2">{day}</div>
                  ))}
                  {calendarGrid.map((day, i) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const isChecked = habit.completed[dateKey];
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;

                    return (
                      <div
                        key={i}
                        onClick={() => toggleDay(habit.id, dateKey)}
                        className={`w-8 h-8 flex items-center justify-center cursor-pointer relative text-lg ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}`}
                      >
                        {isToday && <div className="absolute inset-0 bg-orange-100/40 rounded-full" />}
                        <span className="relative z-10">
                          {format(day, 'd')}
                        </span>
                        {isChecked && (
                          <div className="absolute inset-0 flex items-center justify-center css-mark-x">
                            <span className="text-3xl font-light select-none opacity-80" style={{ color: habit.color }}>✕</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Habit Input */}
        <form onSubmit={addHabit} className="mt-8 flex gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="New Habit..."
            className="bg-transparent border-b-2 border-slate-400 focus:border-slate-900 outline-none px-2 py-1 text-lg w-64"
          />
          <button type="submit" className="p-2 bg-slate-900 text-white rounded-full hover:scale-110 transition-transform">
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}