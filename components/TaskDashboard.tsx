
import React, { useState, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { CheckIcon, TrashIcon, PlusIcon, PlayIcon, PauseIcon, ClockIcon, FireIcon, DragHandleIcon } from './Icons';

interface SortableTaskItemProps {
  task: Task;
  onToggleTask: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onDeleteRequest: (task: Task) => void;
  formatTime: (seconds: number) => string;
  // Explicitly add key for React 19 prop passing compatibility
  key?: React.Key;
}

const SortableTaskItem = ({ task, onToggleTask, onToggleTimer, onDeleteRequest, formatTime }: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  const getStreakStyle = (count: number) => {
    if (count >= 10) return { bg: "bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400", shadow: "shadow-purple-200", animation: "animate-[bounce_0.5s_infinite]" };
    if (count >= 5) return { bg: "bg-gradient-to-br from-purple-600 to-fuchsia-500", shadow: "shadow-purple-100", animation: "animate-[bounce_1s_infinite]" };
    return { bg: "bg-gradient-to-br from-purple-500 to-fuchsia-400", shadow: "shadow-purple-50", animation: "animate-[bounce_2s_infinite]" };
  };

  const streakStyle = getStreakStyle(task.streak);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`task-item group flex flex-col p-4 bg-white rounded-3xl border border-slate-100 shadow-sm ${task.completed ? 'opacity-50' : ''} ${isDragging ? 'shadow-xl scale-[1.02] ring-2 ring-purple-200' : 'active:scale-[0.98]'}`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-300 hover:text-slate-400 transition-colors"
        >
          <DragHandleIcon className="w-5 h-5" />
        </div>

        <div 
          onClick={() => onToggleTask(task.id)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            task.completed ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-200 bg-white hover:border-purple-300'
          }`}
        >
          {task.completed && <CheckIcon className="w-5 h-5" />}
        </div>
        
        <div className="flex-grow min-w-0 cursor-pointer" onClick={() => onToggleTask(task.id)}>
          <div className="flex items-center gap-2 overflow-hidden py-1">
            <span className={`font-semibold text-[15px] leading-tight truncate transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.title}
            </span>
            {task.streak > 0 && (
              <div className={`flex items-center gap-1 px-2.5 py-1 ${streakStyle.bg} rounded-full shrink-0 shadow-lg ${streakStyle.shadow} transform scale-90 origin-left ${streakStyle.animation}`}>
                <FireIcon className="w-3 h-3 text-white" />
                <span className="text-[10px] font-black text-white leading-none tracking-tighter">
                  {task.streak}
                </span>
              </div>
            )}
          </div>
          {task.duration && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 mt-0.5">
              <ClockIcon className="w-3 h-3" />
              {task.remainingSeconds !== undefined ? formatTime(task.remainingSeconds) : formatTime(Math.round(task.duration * 60))}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {task.duration && !task.completed && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                task.isRunning ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
              }`}
            >
              {task.isRunning ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteRequest(task); }}
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-400 active:text-red-500 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {task.duration && !task.completed && (
         <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${task.isRunning ? 'bg-orange-400' : 'bg-purple-400'}`}
              style={{ width: `${((task.duration * 60 - (task.remainingSeconds || 0)) / (task.duration * 60)) * 100}%` }}
            ></div>
         </div>
      )}
    </div>
  );
};

interface TaskDashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onAddTask: (title: string, h: number, m: number, s: number) => void;
  onToggleTask: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({ 
  tasks, setTasks, onAddTask, onToggleTask, onToggleTimer, onDeleteTask 
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [hInput, setHInput] = useState('');
  const [mInput, setMInput] = useState('');
  const [sInput, setSInput] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onAddTask(taskInput.trim(), parseInt(hInput) || 0, parseInt(mInput) || 0, parseInt(sInput) || 0);
    setTaskInput(''); setHInput(''); setMInput(''); setSInput('');
    inputRef.current?.blur();
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) parts.push(hours.toString());
    parts.push(minutes.toString().padStart(hours > 0 ? 2 : 1, '0'));
    parts.push(seconds.toString().padStart(2, '0'));
    return parts.join(':');
  };

  return (
    <>
      <main className="flex-grow px-5 mt-8 overflow-y-auto task-list-container scroll-smooth">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Tasks</h3>
          <span className="text-xs font-medium text-slate-400">{tasks.length} total</span>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-40">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <PlusIcon className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-sm text-slate-400">Tap below to add a task</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={tasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTaskItem 
                    key={task.id} 
                    task={task} 
                    onToggleTask={onToggleTask}
                    onToggleTimer={onToggleTimer}
                    onDeleteRequest={setTaskToDelete}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <TrashIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Delete Task?</h3>
              <p className="text-sm text-slate-500 font-medium mb-8">
                Are you sure you want to remove <span className="font-bold text-slate-700">"{taskToDelete.title}"</span>? This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 active:scale-95 transition-all"
                >
                  Delete Task
                </button>
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm active:scale-95 transition-all"
                >
                  Keep It
                </button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setTaskToDelete(null)} />
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 bottom-action-bar bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 space-y-2">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex items-center gap-2">
              <input 
                ref={inputRef}
                type="text" 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="I want to..."
                className="flex-grow pl-5 py-3 bg-transparent text-sm font-semibold focus:outline-none placeholder:text-slate-300 text-slate-700"
              />
              <button 
                type="submit"
                className="w-12 h-12 bg-purple-500 rounded-[1.4rem] text-white flex items-center justify-center shadow-lg shadow-purple-100 active:scale-90 transition-transform shrink-0"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between px-3 pb-2 border-t border-slate-50 mt-1 pt-3">
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <ClockIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Duration(optional)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input type="number" value={hInput} onChange={(e) => setHInput(e.target.value)} placeholder="0" className="w-8 text-center text-[11px] font-bold focus:outline-none placeholder:text-slate-200 bg-slate-50 rounded-lg py-1" min="0" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">H</span>
                </div>
                <div className="flex items-center gap-1">
                  <input type="number" value={mInput} onChange={(e) => setMInput(e.target.value)} placeholder="0" className="w-8 text-center text-[11px] font-bold focus:outline-none placeholder:text-slate-200 bg-slate-50 rounded-lg py-1" min="0" max="59" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">M</span>
                </div>
                <div className="flex items-center gap-1">
                  <input type="number" value={sInput} onChange={(e) => setSInput(e.target.value)} placeholder="0" className="w-8 text-center text-[11px] font-bold focus:outline-none placeholder:text-slate-200 bg-slate-50 rounded-lg py-1" min="0" max="59" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">S</span>
                </div>
              </div>
            </div>
          </form>
        </div>
        <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-tighter mt-4 pointer-events-auto">
          Offline & Private • Timer Auto-Completes Tasks
        </p>
      </footer>
    </>
  );
};
