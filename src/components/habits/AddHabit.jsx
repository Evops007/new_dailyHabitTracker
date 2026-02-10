"use client"

import { createHabit } from "@/actions/habit-action";
import { startTransition } from "react";
import "react-day-picker/style.css";

export default function AddHabit({ onAdd }) {

    async function clientAction(formdata) {
        const title = formdata.get("title");
        const icon = formdata.get("icon");

        const optimisticHabit = {
            id: Math.random(),
            title: title,
            icon: icon || "✨",
            logs: []
        }

        startTransition(() => {
            onAdd({ type: 'add', optimisticHabit });
        });

        document.getElementById('addHabit').close()
        const result = await createHabit(formdata)

        if (result?.success) {

        } else {
            alert("Noe gikk galt " + result?.error);
            document.getElementById('addHabit').close()
        }
    }


    return (
        <div>

            <dialog id="addHabit" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box min-h-95/100">
                    <h2>Legg til en ny vane</h2>
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => document.getElementById('addHabit').close()}>✕</button>
                    <form action={clientAction} className="flex flex-col gap-4 mt-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label htmlFor="title" className="font-semibold block mb-2">Vanenavn</label>
                                <input name="title" type="text" placeholder="Luftetur i 20 minutter" className="input input-bordered w-full" required />
                            </div>
                            <div>
                                <label htmlFor="icon" className="font-semibold block mb-2 text-center">Ikon</label>
                                <input name="icon" type="text" placeholder="✨" className="input input-bordered w-16 text-center text-2xl p-0" maxLength="2" />
                            </div>
                        </div>
                        <button type="submit" className="btn bg-secondary-content text-neutral-content w-full">Lagre</button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}