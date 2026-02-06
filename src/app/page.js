import { auth, signIn, signOut } from "@/auth";
import { createHabit, getHabits, updateHabit, deleteHabit, toggleHabit } from "@/actions/habit-action";
import HabitCard from "@/components/habits/HabitCard";
import { AddHabit } from "@/components/habits/AddHabit";
import HabitList from "@/components/habits/HabitList";

export default async function Home() {
  const session = await auth();
  const habits = session ? await getHabits() : [];


  return (
    <div className="min-h-screen bg-base-200 p-4">
      {session ? (
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Hei, {session.user.name} 👋</h1>
              <p className="text-sm opacity-70">Klar for dagens vaner?</p>
            </div>
            <div className="avatar">
               <div className="w-10 rounded-full">
                 {session.user.image && <img src={session.user.image} alt="Avatar" />}
               </div>
            </div>
          </div>

          <div className="space-y-3">
            <HabitList habits={habits} />
          </div>

          {/* Her skal vi sette inn HabitList / HabitCard senere */}
          {/* <div className="space-y-3">
            {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
          <div>
            <AddHabit />
          </div>*/}

          {/* Logg ut knapp (midlertidig plassert bunn) */}
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="text-center mt-10">
            <button className="btn btn-ghost btn-xs text-error">Logg ut</button>
          </form>
        </div>
      ) : (
        /* Login Screen */
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
          <h1 className="text-4xl font-bold text-primary">Habit Tracker</h1>
          <p>Aldri glem vanene dine</p>
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button className="btn btn-primary btn-wide">Logg inn med Google</button>
          </form>
        </div>
      )}
    </div>
  );
}