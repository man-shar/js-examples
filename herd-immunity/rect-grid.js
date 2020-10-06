// takes some inputs and returns an array of x, y coordinates
// align:
// -1: left
//  0: center
//  1: right
function rectGrid({
  perRow,
  total,
  xOffset,
  yOffsetPerRow,
  alternating = false,
  initialArray = null,
  align = 0,
  cellPadding = 0,
} = {}) {
  var coords = [];
  var cellCount = 0;
  var rowNum = 0;
  var width = xOffset * perRow;
  var alternateOffset = alternating ? xOffset / 2 : 0;
  var margin = {
    top: 10,
    bottom: 0,
    left: 0.01 * width,
    right: 0.01 * width,
  };

  var extentX = [Infinity, -Infinity];
  var extentY = [Infinity, -Infinity];

  function xPos(cellNum, centerX) {
    if (align === 0) {
      return (
        centerX + (cellNum % 2 ? 1 : -1) * Math.ceil(cellNum / 2) * xOffset
      );
    }

    return cellNum * xOffset + cellPadding;
  }

  function yPos(rowNum) {
    return margin.top + rowNum * yOffsetPerRow + cellPadding;
  }

  function xy(cellNumWithinRow, rowNum, offset, centerX) {
    const x = (offset ? alternateOffset : 0) + xPos(cellNumWithinRow, centerX);
    const y = yPos(rowNum);

    if (x < extentX[0]) extentX[0] = x;
    if (x > extentX[1]) extentX[1] = x + xOffset;
    if (y < extentY[0]) extentY[0] = y;
    if (y > extentY[1]) extentY[1] = y + yOffsetPerRow;

    return { x, y };
  }

  if (initialArray) {
    initialArray.forEach((customRowCellCount) => {
      var row = [];
      const offset = rowNum % 2;
      const fullRowCellCount = offset ? perRow - 1 : perRow;
      const centerX = Math.floor(fullRowCellCount / 2) * xOffset;
      for (let i = 0; i < customRowCellCount && cellCount < total; i++) {
        row.push(xy(i, rowNum, offset, centerX));
        cellCount++;
      }
      row.sort((a, b) => {
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
      });

      for (let i = 0; i < row.length; i++) {
        row[i].id = rowNum + "_" + i;
      }

      coords.push(row);
      rowNum++;
    });
  }

  while (cellCount < total) {
    var row = [];
    const offset = alternating ? rowNum % 2 : 0;
    var fullRowCellCount = offset ? perRow - 1 : perRow;
    const centerX = Math.floor(fullRowCellCount / 2) * xOffset;

    for (let i = 0; i < fullRowCellCount && cellCount < total; i++) {
      row.push(xy(i, rowNum, offset, centerX));
      cellCount++;
    }
    row.sort((a, b) => {
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
    });

    for (let i = 0; i < row.length; i++) {
      row[i].id = rowNum + "_" + i;
    }

    coords.push(row);
    rowNum++;
  }

  return {
    coords,
    extentX,
    extentY,
  };
}

export default rectGrid;
