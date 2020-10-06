// takes some inputs and returns an array of x, y coordinates
function makeDistribution({
  perRow,
  total,
  xOffset,
  yOffsetPerRow,
  alternating = false,
  initialArray = null,
  // align:
  // -1: left
  //  0: center
  //  1: right
  align = 0,
}) {
  var coords = [];
  var cellCount = 0;
  var rowNum = 0;
  var width = xOffset * perRow;
  var alternateOffset = alternating ? xOffset / 2 : 0;
  var padding = {
    top: 10,
    bottom: 0,
    left: 0.01 * width,
    right: 0.01 * width,
  };

  var extentX = [0, -Infinity];
  var extentY = [Infinity, -Infinity];

  function xPos(cellNum, centerX) {
    if (align === 0) {
      return (
        centerX + (cellNum % 2 ? 1 : -1) * Math.ceil(cellNum / 2) * xOffset
      );
    }

    return cellNum * xOffset;
  }

  function yPos(rowNum) {
    return padding.top + rowNum * yOffsetPerRow;
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
      const offset = rowNum % 2;
      const fullRowCellCount = offset ? perRow - 1 : perRow;
      const centerX = Math.floor(fullRowCellCount / 2) * xOffset;
      for (let i = 0; i < customRowCellCount && cellCount < total; i++) {
        coords.push(xy(i, rowNum, offset, centerX));
        cellCount++;
      }
      rowNum++;
    });
  }

  while (cellCount < total) {
    const offset = rowNum % 2;
    var fullRowCellCount = offset ? perRow - 1 : perRow;
    const centerX = Math.floor(fullRowCellCount / 2) * xOffset;

    for (let i = 0; i < fullRowCellCount && cellCount < total; i++) {
      coords.push(xy(i, rowNum, offset, centerX));
      cellCount++;
    }
    rowNum++;
  }

  return {
    coords,
    extentX,
    extentY,
  };
}

export default makeDistribution;
