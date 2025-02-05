import { isSameDay } from 'date-fns';
import { useCallback } from 'react';

import { useIndividualContext } from '$components/common/app-context';

/**
 * Custom hook that returns the currently selected day and a function to select
 * a day. When the setter function is called, the current PDF index is updated
 * based on the selected day's index.
 *
 * @param {Array<Date>} arrowDates - An array of dates to select from.
 * @returns {[Date | undefined, (day: Date) => void]} - A tuple containing the
 * selected day and a function to select a day.
 */
export function useDaySelect(arrowDates) {
  const { currentPDFIndex, setCurrentPDFIndex } = useIndividualContext();

  const onDaySelect = useCallback(
    (day) => {
      const index = arrowDates?.findIndex((d) => isSameDay(d, day)) || -1;
      if (index !== -1) {
        setCurrentPDFIndex(index);
      }
    },
    [arrowDates, setCurrentPDFIndex]
  );

  const selectedDay = arrowDates ? arrowDates[currentPDFIndex] : undefined;

  return [selectedDay, onDaySelect];
}

// type CombineData = <R, T extends unknown[][]>(
//   matrix: [...T],
//   cb: (...args: { [K in keyof T]: T[K] extends (infer U)[] ? U : never }) => R
// ) => R[];

/**
 * Combines data from a matrix using a callback function.
 *
 * @param matrix - A 2D array where each inner array represents a row of data.
 * @param cb - A callback function that takes the values from each column of the
 * matrix and returns a combined result.
 * @returns An array of combined data, where each element is the result of
 * applying the callback function to the corresponding column of the matrix.
 */
export function combineData<R, T extends unknown[][]>(
  matrix: [...T],
  cb: (...args: { [K in keyof T]: T[K] extends (infer U)[] ? U : never }) => R
): R[] {
  return matrix[0].map((_, i) => {
    const values = matrix.map((row) => row[i]) as any;
    return cb(...values);
  });
}
