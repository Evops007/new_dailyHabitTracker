"use client"
import { useOptimistic } from "react"
import { HabitCard } from "./HabitCard"
import AddHabit from "./AddHabit"

export default function HabitList({ habits }) {
    let completedHabits = [];
    const [optimisticState, setOptimisticState] = useOptimistic(
        habits,
        (currentHabits, habitAction) => {
            switch (habitAction.type) {
                case 'add':
                    return [habitAction.optimisticHabit, ...currentHabits];
                
                case 'delete':
                    return currentHabits.filter(habit => habit.id !== habitAction.id)
                    
                
                case 'edit':  
                    return currentHabits.map(habit => habit.id === habitAction.habitToEdit.id ? habitAction.habitToEdit : habit)
                
                default:
                    break;
            }
        }
    )
    console.log(completedHabits)

    return (
        <div>
            <div className="space-y-3">
                {optimisticState.map((habit) => (
                    <HabitCard onDelete={setOptimisticState} onEdit={setOptimisticState} onToggle={setOptimisticState} key={habit.id} habit={habit} />
                ))}
            </div>

            <div>
                <AddHabit onAdd={setOptimisticState} />
            </div>
        </div>
        
    )
}