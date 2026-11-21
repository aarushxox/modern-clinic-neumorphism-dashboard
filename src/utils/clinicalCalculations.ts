/**
 * Dr. J.S. Pandey Clinic - Clinical & Demographic Calculations Engine
 * Real-time age computation, date rollover, and forensic data validation
 */

export interface ComputedAge {
  currentAge: number;
  recordedAge: number;
  displayAge: string;
  isEstimated: boolean;
  birthDateFormatted: string;
  ageYears: number;
  ageMonths: number;
}

/**
 * Computes the exact current age of a patient based on:
 * 1. Valid dobirth if available (exact calendar calculation handling leap years & birthday rollover)
 * 2. If DOB is missing: registration / earliest visit date minus recorded age to infer birth date
 * 3. Fallback to recorded age if no date reference is found
 */
export function computeCurrentAge(
  patient: {
    dobirth?: string;
    ageYears?: number;
    ageMonths?: number;
    firstVisitDate?: string;
  },
  referenceDate: Date = new Date() // defaults to current system date (e.g. 2026)
): ComputedAge {
  const recordedAgeYears = patient.ageYears || 0;
  const recordedAgeMonths = patient.ageMonths || 0;

  // Case 1: Valid dobirth string exists
  if (patient.dobirth && /^\d{4}-\d{2}-\d{2}$/.test(patient.dobirth)) {
    const [bYear, bMonth, bDay] = patient.dobirth.split('-').map(Number);
    const birthDate = new Date(bYear, bMonth - 1, bDay);

    if (!isNaN(birthDate.getTime()) && bYear > 1900 && bYear <= referenceDate.getFullYear()) {
      let years = referenceDate.getFullYear() - birthDate.getFullYear();
      let months = referenceDate.getMonth() - birthDate.getMonth();
      const days = referenceDate.getDate() - birthDate.getDate();

      if (days < 0) {
        months -= 1;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const exactYears = Math.max(0, years);
      const exactMonths = Math.max(0, months);

      let displayAge = `${exactYears} yrs`;
      if (exactYears < 5 && exactMonths > 0) {
        displayAge = `${exactYears}y ${exactMonths}m`;
      }

      return {
        currentAge: exactYears,
        recordedAge: recordedAgeYears,
        displayAge,
        isEstimated: false,
        birthDateFormatted: patient.dobirth,
        ageYears: exactYears,
        ageMonths: exactMonths,
      };
    }
  }

  // Case 2: Inferred from firstVisitDate / registration date - recorded age
  if (patient.firstVisitDate && /^\d{4}-\d{2}-\d{2}$/.test(patient.firstVisitDate) && recordedAgeYears > 0) {
    const [regYear, regMonth, regDay] = patient.firstVisitDate.split('-').map(Number);
    const inferredBirthYear = regYear - recordedAgeYears;
    const inferredBirthDate = new Date(inferredBirthYear, regMonth - 1, regDay);

    if (!isNaN(inferredBirthDate.getTime()) && inferredBirthYear > 1900) {
      let years = referenceDate.getFullYear() - inferredBirthYear;
      let months = referenceDate.getMonth() - (regMonth - 1);
      const days = referenceDate.getDate() - regDay;

      if (days < 0) months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const calculatedYears = Math.max(0, years);
      const calculatedMonths = Math.max(0, months);

      const inferredDobString = `${inferredBirthYear}-${String(regMonth).padStart(2, '0')}-${String(regDay).padStart(2, '0')}`;

      return {
        currentAge: calculatedYears,
        recordedAge: recordedAgeYears,
        displayAge: `${calculatedYears} yrs (inferred)`,
        isEstimated: true,
        birthDateFormatted: inferredDobString,
        ageYears: calculatedYears,
        ageMonths: calculatedMonths,
      };
    }
  }

  // Case 3: Fallback to recorded age
  return {
    currentAge: recordedAgeYears,
    recordedAge: recordedAgeYears,
    displayAge: `${recordedAgeYears} yrs (as recorded)`,
    isEstimated: true,
    birthDateFormatted: 'Unknown',
    ageYears: recordedAgeYears,
    ageMonths: recordedAgeMonths,
  };
}

/**
 * Maps an age in years into standard clinical age cohorts
 */
export function getAgeCohort(ageYears: number): string {
  if (ageYears <= 10) return '0-10';
  if (ageYears <= 20) return '11-20';
  if (ageYears <= 30) return '21-30';
  if (ageYears <= 40) return '31-40';
  if (ageYears <= 50) return '41-50';
  if (ageYears <= 60) return '51-60';
  if (ageYears <= 70) return '61-70';
  if (ageYears <= 80) return '71-80';
  return '81+';
}
