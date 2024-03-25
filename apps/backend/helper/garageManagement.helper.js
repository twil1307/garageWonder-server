export const mapExistedDateSlot = (existedDateSlot) => {
  return (
    existedDateSlot && existedDateSlot.length > 0
      ? existedDateSlot[0].dateSlot
      : []
  ).map((el) => Number.parseInt(el.date));
};

export const reduceObjectArrayToObj = (existedDateSlot) => {
    return (
        existedDateSlot && existedDateSlot.length > 0
          ? existedDateSlot[0].dateSlot
          : []
      ).reduce((acc, cur) => {
        acc[cur?.date] = {
            extraFee: cur?.extraFee,
            extraFeeCreatedAt: cur?.extraFeeCreatedAt
        };
        return acc;
      }, {})
}