export const mapSort = (array, order, key) => {
  const sorted = array.slice().sort((a, b) => {
    const A = a[key];
    const B = b[key];
    return order.indexOf(A) > order.indexOf(B) ? 1 : -1;
  });
  return sorted;
};

export const _chunk = (array = [], size = 1) => {
  let arrayChunks = [];
  for (let i = 0; i < array.length; i += size) {
    let arrayChunk = array.slice(i, i + size);
    arrayChunks.push(arrayChunk);
  }
  return arrayChunks;
};
