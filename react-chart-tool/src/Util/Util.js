import ShapeUtil from "./ShapeUtil"

// contains Utility functions that may not be shape functions
const Util = {};

Util.toSentenceCase = function(text) {
  return text[0].toUpperCase() + text.substr(1);
}

// add index column to parsed file
Util.addIndexColumnToParsedFile = function(parsedFile){
  const columns = parsedFile.columns.slice();
  columns.unshift("index");

  parsedFile.forEach((row, i) => (row["index"] = i));
  parsedFile.columns = columns;

  return parsedFile;
};

Util.columnType = function(data, column) {
  // just check first row for now.
  // TODO: add stuff for dates, etc;
  return (isNaN(data[0][column]) ? "string" : "number");
};

Util.strLen = 10;

Util.shortenString =  function (fullStr, separator) {
  const self = this;
  if (fullStr.length <= self.strLen) return fullStr;

  separator = separator || '...';

  var sepLen = separator.length,
      charsToShow = self.strLen - sepLen,
      frontChars = Math.ceil(charsToShow/2),
      backChars = Math.floor(charsToShow/2);

  return fullStr.substr(0, frontChars) +
         separator +
         fullStr.substr(fullStr.length - backChars);
};

Util.escapeRegExp= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export default Util;
