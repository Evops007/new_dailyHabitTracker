"use client"
import { useOptimistic, useState } from "react"
import { HabitCard } from "./HabitCard"
import AddHabit from "./AddHabit"
import DateNavigator from "./DateNavigator"

export default function HabitList({ habits, userCreatedAt }) {

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
                    const targetDateStr = habitAction.selectedDate.toDateString(); // <--- Bruk valgt dato!
                    return currentHabits.map(h => {
                        if (h.id !== habitAction.habit.id) return h;
                        const currentLogs = h.logs || [];
                        const isAlreadyDone = currentLogs.some(l => new Date(l.completedDate).toDateString() === targetDateStr);
                        return {
                            ...h,
                            logs: isAlreadyDone
                                ? currentLogs.filter(l => new Date(l.completedDate).toDateString() !== targetDateStr)
                                : [...currentLogs, { id: 'temp-' + Date.now(), completedDate: habitAction.selectedDate.toISOString() }]
                        };
                    });

                default:
                    break;
            }
        }
    )

    const [selectedDate, setSelectedDate] = useState(new Date());

    const selectedDateStr = selectedDate.toDateString();

    const activeHabits = optimisticState.filter(h =>
        !h.logs?.some(l => new Date(l.completedDate).toDateString() === selectedDateStr)
    );

    const completedHabits = optimisticState.filter(h =>
        h.logs?.some(l => new Date(l.completedDate).toDateString() === selectedDateStr)
    );



    return (
        <div>
            {/* Date Navigator */}
            <DateNavigator
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                minDate={new Date(userCreatedAt)}
            />

            <div className="space-y-3">
                {activeHabits.map((habit) => (
                    <HabitCard onDelete={setOptimisticState} onEdit={setOptimisticState} onToggle={setOptimisticState} selectedDate={selectedDate} key={habit.id} habit={habit} />
                ))}
            </div>

            <div className="space-y-3">
                {completedHabits.map((habit) => (
                    <HabitCard onDelete={setOptimisticState} onEdit={setOptimisticState} onToggle={setOptimisticState} selectedDate={selectedDate} key={habit.id} habit={habit} />
                ))}
            </div>

            <div>
                <AddHabit onAdd={setOptimisticState} />
            </div>
        </div>

    )
}