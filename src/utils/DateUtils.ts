/**
 * Formats a date string or timestamp into a readable string (DD MMM YYYY).
 * Handles various input formats including ISO strings, SQL datetime, and timestamps.
 * 
 * @param dateString The date input (string or number)
 * @returns Formatted date string or '-' if invalid/empty
 */
export const formatDate = (dateString: string | number | null | undefined): string => {
    if (!dateString) return '-';

    let date: Date;

    // Handle numeric timestamp (string or number)
    if (typeof dateString === 'number') {
        // Assume seconds if small, milliseconds if large
        date = new Date(dateString < 10000000000 ? dateString * 1000 : dateString);
    } else if (/^\d+$/.test(dateString as string)) {
        const timestamp = parseInt(dateString as string, 10);
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    }
    // Handle "YYYY-MM-DD HH:mm:ss" format (common in SQL)
    else if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
        date = new Date(dateString.replace(' ', 'T'));
    }
    // Standard Date constructor for ISO strings etc.
    else {
        date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
        // If parsing fails, it might be a pre-formatted string (e.g. "30 Dec 2025") from the backend.
        // Return the original string if it's not null/undefined
        return typeof dateString === 'string' ? dateString : 'Invalid Date';
    }

    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};
