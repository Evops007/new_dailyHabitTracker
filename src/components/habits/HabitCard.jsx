"use client"
import { deleteHabit, toggleHabit, updateHabit } from "@/actions/habit-action";
import { startTransition, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function HabitCard({ habit, onDelete, onEdit, onToggle, selectedDate }) {

    const [currentHabitTitle, setCurrentHabitTitle] = useState(habit.title)
    const [currentHabitIcon, setCurrentHabitIcon] = useState(habit.icon || "✨")
    const editModalRef = useRef(null)
    const isDoneToday = habit.logs?.some(l =>
        new Date(l.completedDate).toDateString() === selectedDate.toDateString()
    );
    const [checked, setChecked] = useState(isDoneToday)
    useEffect(() => {
        setChecked(isDoneToday);
        if (habit.title !== currentHabitTitle) setCurrentHabitTitle(habit.title);
        if (habit.icon !== currentHabitIcon) setCurrentHabitIcon(habit.icon || "✨");
    }, [isDoneToday, habit.title, habit.icon]);


    async function handleDelete() {
        startTransition(() => {
            onDelete({ type: 'delete', id: habit.id });
        });

        await deleteHabit(habit.id)
    };

    async function handleEdit() {
        const habitToEdit = {
            ...habit,
            title: currentHabitTitle,
            icon: currentHabitIcon,
        }

        startTransition(() => {
            onEdit({ type: 'edit', habitToEdit })
        });

        editModalRef.current.close();
        await updateHabit(habitToEdit)
    };

    function handleToggle() {
        const newStaus = !checked;
        setChecked(newStaus)
        startTransition(() => {
            onToggle({ type: 'toggle', habit, selectedDate });
        });

        const localDateStr = selectedDate.getFullYear() + '-' +
            String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(selectedDate.getDate()).padStart(2, '0');

        toggleHabit(habit.id, localDateStr);
    }

    // Framer Motion Values
    const x = useMotionValue(0);

    // Logic for snap to open/close
    const handleDragEnd = (event, info) => {
        // Hvis swipet mer enn 50px til venstre, snap åpen (-120px)
        if (info.offset.x < -50) {
            x.set(-120);
        } else {
            // Hvis ikke, snap tilbake til start
            x.set(0);
        }
    };

    return (
        <div className="relative w-full h-[80px] mb-3">
            {/* BACKGROUND ACTIONS LAYER */}
            <div className="absolute inset-0 flex items-center justify-end gap-2 pr-4 bg-error/10 rounded-2xl">
                <button
                    className="btn btn-circle btn-sm btn-info"
                    onClick={() => editModalRef.current.showModal()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button
                    className="btn btn-circle btn-sm btn-error"
                    onClick={handleDelete}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>

            {/* FOREGROUND CARD LAYER */}
            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                onDragEnd={handleDragEnd}
                className={`
                    relative w-full h-full flex items-center justify-between px-4 rounded-2xl z-10
                    ${isDoneToday ? "bg-gray-300" : "bg-base-100 shadow-sm border border-base-200"}
                `}
            >
                <div className={`flex items-center gap-3 ${isDoneToday ? "text-black/50" : ""}`}>
                    <span className="text-3xl">{habit.icon || "✨"}</span>
                    <h6 className="font-semibold">{habit.title}</h6>
                </div>

                <input
                    type="checkbox"
                    className="checkbox border-gray bg-gray-300 checked:border-secoundary checked:bg-secondary/70 checked:text-secoundary"
                    onChange={handleToggle}
                    checked={checked}
                    // Stopp drag når man trykker på checkbox
                    onPointerDown={(e) => e.stopPropagation()}
                />
            </motion.div>

            {/* EDIT MODAL */}
            <dialog ref={editModalRef} className="modal modal-bottom sm:modal-middle" onClose={() => x.set(0)}>
                <div className="modal-box min-h-95/100">
                    <h2>Rediger vane</h2>
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => editModalRef.current.close()}>✕</button>
                    <form action={handleEdit} className="flex flex-col gap-4 mt-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label htmlFor="title" className="font-semibold block mb-2">Vanenavn</label>
                                <input name="title" type="text" className="input input-bordered w-full" value={currentHabitTitle} onChange={(e) => setCurrentHabitTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="icon" className="font-semibold block mb-2 text-center">Ikon</label>
                                <input name="icon" type="text" className="input input-bordered w-16 text-center text-2xl p-0" maxLength="2" value={currentHabitIcon} onChange={(e) => setCurrentHabitIcon(e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" className="btn bg-primary-content text-neutral-content w-full">Lagre</button>
                    </form>
                </div>
            </dialog>
        </div>
    )
};