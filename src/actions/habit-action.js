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
    const icon = formData.get("icon")

    try {
        await prisma.habit.create({
            data: {
                title: title,
                icon: icon || "✨",
                userId: session.user.id
            },
        });

        revalidatePath("/");
        return { success: true };
    }

    catch (error) {
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
    const newIcon = habitData.icon;

    try {
        await prisma.habit.updateMany({
            where: {
                id: habitId,
                userId: session.user.id
            },
            data: {
                title: newTitle,
                icon: newIcon || "✨"
            }
        });
        revalidatePath("/");
        return { success: true };
    }

    catch (error) {
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

    catch (error) {
        console.error("feil ved sletting av vane:", error)
        return { success: false, error: "klarte ikke slette vanen" }
    }

}

export async function toggleHabit(habitId, dateString) {
    const session = await auth();
    if (!session?.user?.id) return;

    // Normaliser dato til UTC midnatt for den valgte dagen
    const simpleDate = dateString.split('T')[0];
    const targetDate = new Date(`${simpleDate}T00:00:00.000Z`);

    // Sjekk at vanen tilhører brukeren
    const habit = await prisma.habit.findUnique({
        where: { id: habitId, userId: session.user.id }
    });

    if (!habit) {
        throw new Error("Ingen tilgang til denne vanen.");
    }

    // Finn eksisterende logg ved å lete i et vindu på +/- 12 timer
    // Dette fanger opp logger som ble lagret med tidssone-offset tidligere
    const existingLog = await prisma.habitLog.findFirst({
        where: {
            habitId: habitId,
            completedDate: {
                gte: new Date(targetDate.getTime() - 12 * 60 * 60 * 1000),
                lte: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000)
            }
        }
    });

    try {
        if (existingLog) {
            await prisma.habitLog.delete({
                where: { id: existingLog.id }
            });
        } else {
            await prisma.habitLog.create({
                data: {
                    habitId: habitId,
                    completedDate: targetDate, // Lagre som ren UTC midnatt
                    completed: true
                }
            })
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Feil ved fullføring av oppgave:", error);
        return { success: false };
    }
}

export async function getHabitStats() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { createdAt: true }
    });

    const habits = await prisma.habit.findMany({
        where: { userId: session.user.id },
        include: { logs: true }
    });

    if (habits.length === 0) return { avgPerDay: 0, streak: 0 };

    // Hjelpefunksjon for å få UTC dato-streng (YYYY-MM-DD)
    const getUTCDateString = (date) => {
        return date.toISOString().split('T')[0];
    };

    // 1. Beregn snitt pr dag
    const totalLogs = habits.reduce((acc, habit) => acc + habit.logs.length, 0);
    const startDate = new Date(user.createdAt);
    startDate.setUTCHours(0, 0, 0, 0);

    // Vi bruker serverens nåværende tid, men normalisert til UTC midnatt for sammenligning
    const today = new Date();
    const todayStr = getUTCDateString(today);
    const todayUTC = new Date(`${todayStr}T00:00:00.000Z`);

    // Beregn antall dager siden start (inkludert i dag)
    const diffTime = Math.abs(todayUTC - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const avgPerDay = (totalLogs / diffDays).toFixed(1);

    // 2. Beregn streak
    // Grupper logger per dato (UTC)
    const logsByDate = {};
    habits.forEach(habit => {
        habit.logs.forEach(log => {
            const dateStr = getUTCDateString(new Date(log.completedDate));
            logsByDate[dateStr] = (logsByDate[dateStr] || 0) + 1;
        });
    });

    let streak = 0;
    let checkDate = new Date(todayUTC);
    const userCreatedAtStr = getUTCDateString(new Date(user.createdAt));

    while (true) {
        const dateStr = getUTCDateString(checkDate);

        // Stopp hvis vi går lenger tilbake enn når brukeren ble opprettet
        if (dateStr < userCreatedAtStr) break;

        // Finn ut hvor mange vaner som faktisk eksisterte på denne datoen (UTC)
        const habitsOnDateCount = habits.filter(habit => {
            const habitCreatedStr = getUTCDateString(new Date(habit.createdAt));
            return habitCreatedStr <= dateStr;
        }).length;

        const completedCount = logsByDate[dateStr] || 0;

        // En "perfekt dag" er hvis:
        // 1. Du har gjort alle vaner som eksisterte da (minst 1)
        // 2. ELLER du har gjort vaner du la inn senere (backfilling)
        const isPerfectDay = (habitsOnDateCount > 0 && completedCount >= habitsOnDateCount) ||
            (habitsOnDateCount === 0 && completedCount > 0);

        if (isPerfectDay) {
            streak++;
            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } else {
            // Hvis det er i dag og vi ikke er ferdige, sjekk i går før vi gir opp
            if (streak === 0 && dateStr === todayStr) {
                checkDate.setUTCDate(checkDate.getUTCDate() - 1);
                continue;
            }
            break;
        }
    }

    return {
        avgPerDay,
        streak
    };
}