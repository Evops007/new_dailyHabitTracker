"use server"

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";


export async function createHabit(formData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Du må være logget inn for å legge til vaner.");
    }

    const title = formData.get("title")

    try {
        await prisma.habit.create({
            data: {
                title: title,
                userId: session.user.id
            },
        });

        revalidatePath("/");
        return { success: true };
    }

    catch(error) {
        console.error("feil ved oppretting av vane:", error)
        return { success: false, error: "klarte ikke lagre vanen" }
    }
}

export async function getHabits() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Du må være logget inn for å legge til vaner.");
    }

    const habits = await prisma.habit.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            logs: true
        },
        orderBy: {
            createdAt: "desc"
        },
    });

    return habits
}

export async function updateHabit(habitData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Du må være logget inn for å legge til vaner.");
    }

    const habitId = habitData.id;
    const newTitle = habitData.title;

    try {
        await prisma.habit.updateMany({
            where: {
                id: habitId,
                userId: session.user.id
            },
            data: {
                title: newTitle
            }
        });
        revalidatePath("/");
        return { success: true };
    }

    catch(error) {
        console.error("feil ved oppdatering av vane:", error)
        return { success: false, error: "klarte ikke oppdatere vanen" }
    }

}

export async function deleteHabit(habitId) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Du må være logget inn for å slette vaner.");
    }

    try {
        await prisma.habit.deleteMany({
            where: {
                id: habitId,
                userId: session.user.id
            },
        });

        revalidatePath("/");
        return { success: true };
    }

    catch(error) {
        console.error("feil ved sletting av vane:", error)
        return { success: false, error: "klarte ikke slette vanen" }
    }

}

export async function toggleHabit(habitId, dateString) {
    const session = await auth();
    if (!session?.user?.id) return;

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    const exsistingLog = await prisma.habitLog.findUnique({
        where: {
            habitId_completedDate: {
                habitId: habitId,
                completedDate: targetDate
            }
        }
    });
    
    try {
        if(exsistingLog) {
            await prisma.habitLog.delete({
                where: {
                    id: exsistingLog.id
                }
            });
        } else {
            await prisma.habitLog.create({
                data: {
                    habitId: habitId,
                    completedDate: targetDate,
                    completed: true
                }
            })
        }
        revalidatePath("/");
        return { success: true };
    }

    catch(error) {
        console.error("Feil ved fullføring av oppgave:", error);
        return { success: false };
    }
}