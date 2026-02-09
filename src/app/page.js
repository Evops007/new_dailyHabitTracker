import { auth, signIn, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { getHabits } from "@/actions/habit-action";
import HabitList from "@/components/habits/HabitList";

export default async function Home() {
  const session = await auth();
  const habits = session ? await getHabits() : [];

  let user = null;
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true }
    });
  }


  return (
    <div className="min-h-screen bg-base-200 p-4">
      {session ? (
        <div className="max-w-md mx-auto space-y-6">

          <div className="space-y-3">
            <HabitList habits={habits} userCreatedAt={user?.createdAt} />
          </div>

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