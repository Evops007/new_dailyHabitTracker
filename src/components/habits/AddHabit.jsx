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
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button className="btn btn-circle btn-sm bg-secondary-content" onClick={() => document.getElementById('addHabit').showModal()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 fill-neutral-content">
                        <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
                    </svg>
                </button>
            </div>
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
                        <button type="submit" className="btn btn-primary w-full">Lagre</button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}