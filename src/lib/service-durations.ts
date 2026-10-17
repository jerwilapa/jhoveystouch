export const serviceDurations: Record<string, number> = {
  Haircut: 45,
  "Blow-dry": 30,
  "Special occasion hairstyle": 90,
  "Bridal hairstyle": 120,
  "Root touch-up": 90,
  "Full hair color": 150,
  Highlights: 180,
  "Balayage / ombre": 210,
  "Hair treatment": 60,
  "Brow shaping & grooming": 30,
  "Brow threading": 15,
  "Brow waxing": 15,
  "Brow tint": 20,
  "Eyelash extensions": 120,
  "Classic manicure & pedicure": 90,
  "Acrylic / gel nail extensions": 120,
  "French manicure & pedicure": 105,
  "Nail art & design": 60,
  "Nail care": 45,
};

export function getAppointmentDuration(serviceIds: string[]) {
  let totalMinutes = 0;

  for (const serviceId of serviceIds) {
    if (!Object.hasOwn(serviceDurations, serviceId)) return null;
    const duration = serviceDurations[serviceId];
    if (duration === undefined) return null;
    totalMinutes += duration;
  }

  return totalMinutes > 0 ? totalMinutes : null;
}
