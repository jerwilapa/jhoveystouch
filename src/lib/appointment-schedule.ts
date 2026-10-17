export const OPENING_MINUTES = 6 * 60;
export const CLOSING_MINUTES = 22 * 60;

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function appointmentTimesOverlap(
  firstStart: number,
  firstDuration: number,
  secondStart: number,
  secondDuration: number,
) {
  return (
    firstStart < secondStart + secondDuration &&
    secondStart < firstStart + firstDuration
  );
}
