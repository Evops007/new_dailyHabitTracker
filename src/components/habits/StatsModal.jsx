"use client"

export default function StatsModal({ stats }) {
    if (!stats) return null;

    return (
        <dialog id="statsModal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box bg-base-100 p-6">
                <h3 className="font-bold! text-lg mb-6">Din Statistikk 📊</h3>

                <div className="flex flex-col gap-4">
                    <div className="stats shadow bg-base-200 w-full">
                        <div className="stat">
                            <div className="stat-title text-sm opacity-70">Snitt fullført pr. dag</div>
                            <div className="stat-value text-primary">{stats.avgPerDay}</div>
                            <div className="stat-desc">Siden din første dag</div>
                        </div>
                    </div>

                    <div className="stats shadow bg-base-200 w-full">
                        <div className="stat">
                            <div className="stat-title text-sm opacity-70">Perfekte dager på rad</div>
                            <div className="stat-value text-primary">{stats.streak} </div>
                            <div className="stat-desc">Dager med alt fullført 🔥</div>
                        </div>
                    </div>
                </div>

                <div className="modal-action mt-8">
                    <button className="btn btn-block" onClick={() => document.getElementById('statsModal').close()}>
                        Lukk
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
