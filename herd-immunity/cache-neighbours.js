// structure is a bit weird:
/* {
  perRowA: {
    rowCountA: {},
    rowCountB: {},
  },
  ...
}
*/

window.neighbours = {};

export function cache(colCount, rowCount) {
  // console.log(`caching - ${colCount}, ${rowCount}`);

  var data = [];
  for (let rowNum = 0; rowNum < rowCount; rowNum++) {
    data[rowNum] = [];
    for (let colNum = 0; colNum < colCount; colNum++) {
      data[rowNum][colNum] = [];
      for (
        let k = Math.max(0, rowNum - 1);
        k <= Math.min(rowCount - 1, rowNum + 1);
        k++
      ) {
        for (
          let l = Math.max(0, colNum - 1);
          l <= Math.min(colCount - 1, colNum + 1);
          l++
        ) {
          if (k !== rowNum || l !== colNum) {
            data[rowNum][colNum][data[rowNum][colNum].length] = [k, l];
          }
        }
      }
    }
  }
  return data;
}
