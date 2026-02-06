"use client"
import { deleteHabit } from "@/actions/habit-action";
import { startTransition } from "react";


export function HabitCard({ habit, onDelete }) {
    
    async function handleDelete() {
        
        startTransition(() => {
            onDelete({type: 'delete', id: habit.id});
        });

        await deleteHabit(habit.id)
    }
    
    return (
        <div>
            <p>{habit.title}</p>
            <button className="btn" onClick={handleDelete}>X</button>
        </div>
    )
}