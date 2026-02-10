import { auth, signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { getHabits, getHabitStats } from "@/actions/habit-action";
import HabitList from "@/components/habits/HabitList";
import BottomNav from "@/components/layout/BottomNav";
import StatsModal from "@/components/habits/StatsModal";

export default async function Home() {
  const session = await auth();
  const habits = session ? await getHabits() : [];
  const stats = session ? await getHabitStats() : null;

  let user = null;
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true }
    });
  }


  return (
    <div className="min-h-screen bg-base-content p-4 pb-24">
      {session ? (
        <div className="max-w-md mx-auto space-y-6">
          <HabitList habits={habits} userCreatedAt={user?.createdAt} />
          <StatsModal stats={stats} />
          <BottomNav />
        </div>
      ) : (
        /* Login Screen */
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-12 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl! font-black tracking-tighter text-neutral-content!">Habit Tracker</h1>
            <p className="text-neutral-content">Få kontroll på hverdagen</p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button className=" mt-4 flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 border border-gray-300 rounded-full shadow-md transition-all active:scale-95 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Logg inn med Google</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}