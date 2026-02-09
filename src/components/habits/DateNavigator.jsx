"use client"
import { useState } from "react";

export default function DateNavigator({ selectedDate, onDateChange, minDate }) {
    const [touchStart, setTouchStart] = useState(null);

    // Generer array med 5 dager (2 før, i dag, 2 etter)
    const getDaysArray = () => {
        const days = [];
        for (let i = -2; i <= 2; i++) {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const days = getDaysArray();

    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);

        // Sjekk om vi går før minDate
        if (minDate && newDate < minDate) return;

        onDateChange(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const isDisabled = (date) => {
        return minDate && date < minDate;
    };

    // Touch swipe support
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        // Swipe left = next day
        if (diff > 50) {
            goToNextDay();
        }
        // Swipe right = previous day
        if (diff < -50) {
            goToPreviousDay();
        }

        setTouchStart(null);
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const monthNames = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
        const month = monthNames[date.getMonth()];
        return { day, month };
    };

    const getDayName = (date) => {
        const dayNames = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
        return dayNames[date.getDay()];
    };

    return (
        <div className="w-full mb-4">
            <div className="flex items-center justify-center gap-2">
                {/* Previous button */}
                <button
                    onClick={goToPreviousDay}
                    disabled={minDate && new Date(selectedDate).setDate(selectedDate.getDate() - 1) < minDate}
                    className="btn btn-circle btn-xs btn-ghost flex-shrink-0"
                    aria-label="Forrige dag"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Days container */}
                <div className="flex gap-2 justify-center flex-1">
                    {days.map((date, index) => {
                        const { day, month } = formatDate(date);
                        const dayName = getDayName(date);
                        const selected = isSelected(date);
                        const today = isToday(date);
                        const disabled = isDisabled(date);

                        return (
                            <button
                                key={index}
                                onClick={() => !disabled && onDateChange(date)}
                                disabled={disabled}
                                className={`
                                    flex flex-col items-center justify-center
                                    w-[50px] h-[56px] rounded-lg shrink-0
                                    transition-all duration-200
                                    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}
                                `}
                            >
                                <span className="text-[9px] font-medium uppercase opacity-70 text-base-content">
                                    {dayName}
                                </span>
                                <span
                                    className={`
                                        text-lg
                                        w-8 h-8 flex items-center justify-center rounded-full
                                        
                                        ${selected && today
                                            ? 'bg-accent text-accent-content border-2 border-accent font-bold'
                                            : selected
                                                ? 'border-2 border-primary text-primary font-bold'
                                                : today
                                                    ? 'bg-accent text-accent-content font-bold border-2 border-accent'
                                                    : 'text-base-content font-bold'
                                        }
                                    `}
                                >
                                    {day}
                                </span>
                                <span className="text-[9px] opacity-70 text-base-content">
                                    {month}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Next button */}
                <button
                    onClick={goToNextDay}
                    className="btn btn-circle btn-xs btn-ghost flex-shrink-0"
                    aria-label="Neste dag"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
