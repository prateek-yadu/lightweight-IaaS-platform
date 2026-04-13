/**
 * Checks if a given plan has expired or not
 * @param date - The date to check against current time
 * @returns True if the plan has expired, false if plan is vailed
 * @example
 * // Returns true
 * isExpired(new Date('2020-01-01'))
 * 
 * // Returns false  
 * isExpired(new Date('2050-01-01'))
 */

export const isExpired = (date: Date) => {
    const currentDate = new Date();
    const expired: boolean = date <= currentDate;
    return expired;
};