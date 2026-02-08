"use client"
import { useOptimistic, useState } from "react"
import { HabitCard } from "./HabitCard"
import AddHabit from "./AddHabit"

export default function HabitList({ habits }) {

    const [optimisticState, setOptimisticState] = useOptimistic(
        habits,
        (currentHabits, habitAction) => {
            switch (habitAction.type) {
                case 'add':
                    return [habitAction.optimisticHabit, ...currentHabits];
                
                case 'delete':
                    return currentHabits.filter(habit => habit.id !== habitAction.id);
                    
                
                case 'edit':  
                    return currentHabits.map(habit => habit.id === habitAction.habitToEdit.id ? habitAction.habitToEdit : habit);

                case 'toggle':
                return currentHabits.map(h => {
                    if(h.id !== habitAction.habit.id) return h;
                    const currentLogs = h.logs || []; // Sikkerhet hvis logs mangler
                    const todayStr = new Date().toDateString();
                    
                    const isDone = currentLogs.some(l => new Date(l.completedDate).toDateString() === todayStr);
                    return {
                        ...h,
                        logs: isDone 
                            ? currentLogs.filter(l => new Date(l.completedDate).toDateString() !== todayStr) 
                            : [...currentLogs, { id: 'temp', completedDate: new Date().toISOString() }]
                    }
                })
                
                default:
                    break;
            }
        }
    )

    const today = new Date().toDateString();
    
    const activeHabits = optimisticState.filter(h => 
        !h.logs?.some(l => new Date(l.completedDate).toDateString() === today)
    );
    
    const completedHabits = optimisticState.filter(h => 
        h.logs?.some(l => new Date(l.completedDate).toDateString() === today)
    );


    return (
        <div>
            <div className="space-y-3">
                {activeHabits.map((habit) => (
                    <HabitCard onDelete={setOptimisticState} onEdit={setOptimisticState} onToggle={setOptimisticState} key={habit.id} habit={habit} />
                ))}
            </div>

            <div className="space-y-3">
                {completedHabits.map((habit) => (
                    <HabitCard onDelete={setOptimisticState} onEdit={setOptimisticState} onToggle={setOptimisticState} key={habit.id} habit={habit} />
                ))}
            </div>

            <div>
                <AddHabit onAdd={setOptimisticState} />
            </div>
        </div>
        
    )
}