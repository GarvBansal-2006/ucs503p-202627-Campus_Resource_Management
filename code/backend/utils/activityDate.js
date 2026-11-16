const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnly(value) {
    if (!value) {
        throw new Error('A valid date is required');
    }

    let year;
    let month;
    let day;

    if (typeof value === 'string') {
        const match = value.match(DATE_ONLY_PATTERN);

        if (match) {
            [, year, month, day] = match.map(Number);
        } else {
            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) {
                throw new Error('Invalid date');
            }

            year = parsed.getUTCFullYear();
            month = parsed.getUTCMonth() + 1;
            day = parsed.getUTCDate();
        }
    } else if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new Error('Invalid date');
        }

        year = value.getUTCFullYear();
        month = value.getUTCMonth() + 1;
        day = value.getUTCDate();
    } else {
        throw new Error('Invalid date');
    }

    const normalized = new Date(Date.UTC(year, month - 1, day));

    if (
        normalized.getUTCFullYear() !== year ||
        normalized.getUTCMonth() + 1 !== month ||
        normalized.getUTCDate() !== day
    ) {
        throw new Error('Invalid date');
    }

    return normalized;
}

export function getDayOfWeek(value) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'UTC'
    }).format(parseDateOnly(value));
}

export function getDateKey(value) {
    return parseDateOnly(value).toISOString().slice(0, 10);
}

export function getTodayDateKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getActivityDateQuery({ date, dayOfWeek }) {
    if (date) {
        const normalizedDate = parseDateOnly(date);
        const weekday = dayOfWeek || getDayOfWeek(normalizedDate);

        return {
            $or: [
                { date: normalizedDate },
                { isRecurring: true, dayOfWeek: weekday },
                { date: { $exists: false }, dayOfWeek: weekday },
                { date: null, dayOfWeek: weekday }
            ]
        };
    }

    if (dayOfWeek) {
        return { dayOfWeek };
    }

    throw new Error('A date or weekday is required');
}
