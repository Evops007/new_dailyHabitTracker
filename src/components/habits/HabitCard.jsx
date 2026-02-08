"use client"
import { deleteHabit, toggleHabit, updateHabit } from "@/actions/habit-action";
import { startTransition, useEffect, useRef, useState } from "react";


export function HabitCard({ habit, onDelete, onEdit, onToggle }) {

    const [currentHabitTitle, setCurrentHabitTitle] = useState(habit.title)
    const editModalRef = useRef(null)
    const isDoneToday = habit.logs?.some(l => 
        new Date(l.completedDate).toDateString() === new Date().toDateString()
    );
    const [checked, setChecked] = useState(isDoneToday)
    useEffect(() => {
        setChecked(isDoneToday);
    }, [isDoneToday]);

    
    async function handleDelete() { 
        startTransition(() => {
            onDelete({type: 'delete', id: habit.id});
        });

        await deleteHabit(habit.id)
    };

    async function handleEdit() {
        const habitToEdit = {
            ...habit,
            title: currentHabitTitle,
        }

        startTransition(() => {
            onEdit({type: 'edit', habitToEdit})
        });
        
        editModalRef.current.close(); 
        await updateHabit(habitToEdit)
    };

    function handleToggle() {
        const newStaus = !checked;
        setChecked(newStaus)
        startTransition(() => {
            onToggle({ type: 'toggle', habit });
        });

        toggleHabit(habit.id, new Date().toISOString());
    }
    
    return (
        <>
            <div>
                <div className={isDoneToday ? "bg-gray-300" : ""}>
                    <h6>{habit.title}</h6>
                    <button className="btn btn-error" onClick={handleDelete}>X</button>
                    <input
                        type="checkbox"
                        className="checkbox border-gray bg-gray-300 checked:border-secoundary checked:bg-secondary checked:text-secoundary "
                        onChange={handleToggle}
                        checked={checked}
                    />
                    <button className="btn btn-accent" onClick={()=> editModalRef.current.showModal() }>Rediger vane</button>
                </div>
                <div>
                    <dialog ref={editModalRef} className="modal modal-bottom sm:modal-middle">
                        <div className="modal-box min-h-95/100">
                            <h2>Rediger vane</h2>
                            <div className="modal-action ">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={()=> editModalRef.current.close()}>✕</button>
                                <form action={handleEdit} >
                                    {/* if there is a button in form, it will close the modal */}
                                    <label htmlFor="title" className="font-semibold">Vanenavn</label>
                                    <input name="title" type="text" className="input" value={currentHabitTitle} onChange={(e) => setCurrentHabitTitle(e.target.value)} required/>

                                    {/* --Kode til "daglig varsel"--
                                    <p className="font-semibold">Fra og med</p>
                                    <DayPicker captionLayout="" mode="single" navLayout="around" startMonth={thisDate} timeZone="Europe/Oslo" locale={nb} selected={selected} onSelect={setSelected} />*/}

                                    <button type="submit" className="btn btn-primary">Lagre</button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </>
        
    )
};