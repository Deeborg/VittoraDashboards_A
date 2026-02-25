import { ManualJE, MappedRow } from "./types";


export const joinManualJEAndRenamedData = (
  renamedData: MappedRow[],
  manualJE: ManualJE[],
  amountKeys: { amountCurrentKey: string; amountPreviousKey: string }
): MappedRow[] => {
  return renamedData.map((row) => {
    if (!row.glAccount) return row;

    const je = manualJE.find(
      (je) => je.glAccount === row.glAccount?.toString()
    );

    if (!je) return row;

    const currentAdjustment =
      parseFloat(je[amountKeys.amountCurrentKey] as string) || 0;
    const previousAdjustment =
      parseFloat(je[amountKeys.amountPreviousKey] as string) || 0;

    return {
      ...row,
      amountCurrent: (row.amountCurrent || 0) + currentAdjustment,
      amountPrevious: (row.amountPrevious || 0) + previousAdjustment,
    };
  });
};
