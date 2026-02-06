"use client"

import { createHabit } from "@/actions/habit-action";
import { startTransition } from "react";
import { DayPicker } from "react-day-picker";
import { nb } from "react-day-picker/locale";
import "react-day-picker/style.css";

export default function AddHabit({ onAdd }) {
    /*const [selected, setSelected] = useState(Date);*/ /* kode til daglig varsel */

    const d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDay() + 1;
    let thisDate = `${year}, ${month}, ${day}`;

    async function clientAction(formdata) {
        const title = formdata.get("title");
        const optimisticHabit = {
        id: Math.random(),
        title: title,
        logs: []
        }
        
        startTransition(() => {
            onAdd({type:'add', optimisticHabit});
        });

        document.getElementById('addHabit').close()
        const result = await createHabit(formdata)

        if(result?.success){
            
        } else {
            alert("Noe gikk galt " + result?.error);
            document.getElementById('addHabit').close()
        }
    }
        

    return (
       <div>
            <button className="btn btn-primary rounded-full bg-primary font-semibold text-2xl h-fit" onClick={()=>document.getElementById('addHabit').showModal() }>＋</button>
            <dialog id="addHabit" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box min-h-95/100">
                    <h2>Legg til en ny vane</h2>
                    <div className="modal-action ">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={()=>document.getElementById('addHabit').close()}>✕</button>
                        <form action={clientAction} >
                            {/* if there is a button in form, it will close the modal */}
                            <label htmlFor="title" className="font-semibold">Vanenavn</label>
                            <input name="title" type="text" placeholder="Luftetur i 20 minutter" className="input" required/>

                            {/* --Kode til "daglig varsel"--
                            <p className="font-semibold">Fra og med</p>
                            <DayPicker captionLayout="" mode="single" navLayout="around" startMonth={thisDate} timeZone="Europe/Oslo" locale={nb} selected={selected} onSelect={setSelected} />*/}

                            <button type="submit" className="btn btn-primary">Lagre</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    )
}