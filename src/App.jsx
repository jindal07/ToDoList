import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Check, X, Filter, SortAsc, SortDesc } from 'lucide-react';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('date'); 
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [error, setError] = useState('');

 
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

 
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

 
  const validateInput = (input) => {
    if (!input.trim()) {
      return 'Task cannot be empty';
    }
    if (input.trim().length < 2) {
      return 'Task must be at least 2 characters long';
    }
    if (input.trim().length > 100) {
      return 'Task cannot exceed 100 characters';
    }
    if (tasks.some(task => task.text.toLowerCase() === input.trim().toLowerCase())) {
      return 'Task already exists';
    }
    return '';
  };

  
  const addTask = () => {
    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [...prev, newTask]);
    setInputValue('');
    setError('');
  };

  
  const removeTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };


  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

 
  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

 
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

  
    switch (filter) {
      case 'completed':
        filtered = tasks.filter(task => task.completed);
        break;
      case 'pending':
        filtered = tasks.filter(task => !task.completed);
        break;
      default:
        filtered = tasks;
    }


    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'status':
          comparison = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, filter, sortBy, sortOrder]);

  
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-gray-200 rounded-lg shadow-lg">
      <div>
        <img className=' mx-auto my-auto px-1 py-2' src='./src/assets/clipboard-check.png'>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Get It Done
        </h1>
      </div>
      
     
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-500">Total</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-green-500">Completed</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-orange-500">Pending</div>
        </div>
      </div>

     
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        <p className="text-gray-500 text-sm">
          {inputValue.length}/100 characters
        </p>
      </div>

      
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

      
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>

       
        {stats.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
          >
            Clear Completed ({stats.completed})
          </button>
        )}
      </div>

      
      <div className="space-y-2">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {tasks.length === 0 
              ? "No tasks yet. Add one above!" 
              : "No tasks match the current filter."}
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                task.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {task.completed && <Check size={14} />}
              </button>
              
              <span
                className={`flex-1 ${
                  task.completed 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-800'
                }`}
              >
                {task.text}
              </span>
              
              <span className="text-xs text-gray-400">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
              
              <button
                onClick={() => removeTask(task.id)}
                className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

     
      {tasks.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      )}
    </div>
  );
};

export default App;
