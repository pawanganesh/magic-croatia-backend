export const getObjectWithTruthyValues = (obj: object) =>
  Object.entries(obj).reduce((acc, item) => {
    if (!item[1]) {
      return acc;
    }
    return { ...acc, [item[0]]: item[1] };
  }, {});
