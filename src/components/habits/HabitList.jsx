"use client"
import { useOptimistic } from "react"
import { HabitCard } from "./HabitCard"
import AddHabit from "./AddHabit"

export default function HabitList({ habits }) {
    
    {/*const [optimisticState, setOptimisticState] = useOptimistic(habits, (state, newHabit) => [newHabit, ...state])*/} /* fungerede kode */
    
    const [optimisticState, setOptimisticState] = useOptimistic(
        habits,
        (currentHabits, habitAction) => {
            switch (habitAction.type) {
                case 'add':
                    return [habitAction.optimisticHabit, ...currentHabits];
                
                case 'delete':
                    return currentHabits.filter(habit => habit.id !== habitAction.id )
            
                default:
                    break;
            }
        }
    )

    return (
        <div>
            <div className="space-y-3">
                {optimisticState.map((habit) => (
                    <HabitCard onDelete={setOptimisticState} key={habit.id} habit={habit} />
                ))}
            </div>

            <div>
                <AddHabit onAdd={setOptimisticState} />
            </div>
        </div>
        
    )
}