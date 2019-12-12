// treemapMultidimensional - takes multidimensional data (aka [[23,11],[11,32]] - nested array)
//                           and recursively calls itself using treemapSingledimensional
//                           to create a patchwork of treemaps and merge them
export default function treemapMultidimensional(
  data: any,
  width: number,
  height: number,
  xoffset?: number,
  yoffset?: number,
): any {
  xoffset = typeof xoffset === 'undefined' ? 0 : xoffset;
  yoffset = typeof yoffset === 'undefined' ? 0 : yoffset;

  var mergeddata = [];
  var mergedtreemap;
  var results = [];
  var i;

  if (isArray(data[0])) {
    // if we've got more dimensions of depth
    for (i = 0; i < data.length; i++) {
      mergeddata[i] = sumMultidimensionalArray(data[i]);
    }
    mergedtreemap = treemapSingledimensional(
      mergeddata,
      width,
      height,
      xoffset,
      yoffset,
    );

    for (i = 0; i < data.length; i++) {
      results.push(
        treemapMultidimensional(
          data[i],
          mergedtreemap[i][2] - mergedtreemap[i][0],
          mergedtreemap[i][3] - mergedtreemap[i][1],
          mergedtreemap[i][0],
          mergedtreemap[i][1],
        ),
      );
    }
  } else {
    results = treemapSingledimensional(data, width, height, xoffset, yoffset);
  }
  return results;
}

// normalize - the Bruls algorithm assumes we're passing in areas that nicely fit into our
//             container box, this method takes our raw data and normalizes the data values into
//             area values so that this assumption is valid.
function normalize(data: number[], area: number) {
  var normalizeddata = [];
  var sum = sumArray(data);
  var multiplier = area / sum;
  var i;

  for (i = 0; i < data.length; i++) {
    normalizeddata[i] = data[i] * multiplier;
  }
  return normalizeddata;
}

// treemapSingledimensional - simple wrapper around squarify
function treemapSingledimensional(
  data: any,
  width: number,
  height: number,
  xoffset?: number,
  yoffset?: number,
) {
  xoffset = typeof xoffset === 'undefined' ? 0 : xoffset;
  yoffset = typeof yoffset === 'undefined' ? 0 : yoffset;

  var rawtreemap = squarify(
    normalize(data, width * height),
    [],
    Container(xoffset, yoffset, width, height),
    [],
  );
  return flattenTreemap(rawtreemap);
}

// flattenTreemap - squarify implementation returns an array of arrays of coordinates
//                  because we have a new array everytime we switch to building a new row
//                  this converts it into an array of coordinates.
function flattenTreemap(rawtreemap: number[][][]) {
  var flattreemap = [];
  var i, j;

  for (i = 0; i < rawtreemap.length; i++) {
    for (j = 0; j < rawtreemap[i].length; j++) {
      flattreemap.push(rawtreemap[i][j]);
    }
  }
  return flattreemap;
}

// squarify  - as per the Bruls paper
//             plus coordinates stack and containers so we get
//             usable data out of it
function squarify(data: any, currentrow: any, container: any, stack: any) {
  var length;
  var nextdatapoint;
  var newcontainer;

  if (data.length === 0) {
    stack.push(container.getCoordinates(currentrow));
    return;
  }

  length = container.shortestEdge();
  nextdatapoint = data[0];

  if (improvesRatio(currentrow, nextdatapoint, length)) {
    currentrow.push(nextdatapoint);
    squarify(data.slice(1), currentrow, container, stack);
  } else {
    newcontainer = container.cutArea(sumArray(currentrow), stack);
    stack.push(container.getCoordinates(currentrow));
    squarify(data, [], newcontainer, stack);
  }
  return stack;
}

// improveRatio - implements the worse calculation and comparision as given in Bruls
//                (note the error in the original paper; fixed here)
function improvesRatio(currentrow: any, nextnode: any, length: number) {
  var newrow;

  if (currentrow.length === 0) {
    return true;
  }

  newrow = currentrow.slice();
  newrow.push(nextnode);

  var currentratio = calculateRatio(currentrow, length);
  var newratio = calculateRatio(newrow, length);

  // the pseudocode in the Bruls paper has the direction of the comparison
  // wrong, this is the correct one.
  return currentratio >= newratio;
}

// calculateRatio - calculates the maximum width to height ratio of the
//                  boxes in this row
function calculateRatio(row: number[], length: number) {
  var min = Math.min.apply(Math, row);
  var max = Math.max.apply(Math, row);
  var sum = sumArray(row);
  return Math.max(
    (Math.pow(length, 2) * max) / Math.pow(sum, 2),
    Math.pow(sum, 2) / (Math.pow(length, 2) * min),
  );
}

// isArray - checks if arr is an array
function isArray(arr: any) {
  return arr && arr.constructor === Array;
}

// sumArray - sums a single dimensional array
function sumArray(arr: number[]) {
  var sum = 0;
  var i;

  for (i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// sumMultidimensionalArray - sums the values in a nested array (aka [[0,1],[[2,3]]])
function sumMultidimensionalArray(arr: any) {
  var i,
    total = 0;

  if (isArray(arr[0])) {
    for (i = 0; i < arr.length; i++) {
      total += sumMultidimensionalArray(arr[i]);
    }
  } else {
    total = sumArray(arr);
  }
  return total;
}

function Container(
  xoffset: number,
  yoffset: number,
  width: number,
  height: number,
) {
  this.xoffset = xoffset; // offset from the the top left hand corner
  this.yoffset = yoffset; // ditto
  this.height = height;
  this.width = width;

  this.shortestEdge = function() {
    return Math.min(this.height, this.width);
  };

  // getCoordinates - for a row of boxes which we've placed
  //                  return an array of their cartesian coordinates
  this.getCoordinates = function(row: any) {
    var coordinates = [];
    var subxoffset = this.xoffset,
      subyoffset = this.yoffset; //our offset within the container
    var areawidth = sumArray(row) / this.height;
    var areaheight = sumArray(row) / this.width;
    var i;

    if (this.width >= this.height) {
      for (i = 0; i < row.length; i++) {
        coordinates.push([
          subxoffset,
          subyoffset,
          subxoffset + areawidth,
          subyoffset + row[i] / areawidth,
        ]);
        subyoffset = subyoffset + row[i] / areawidth;
      }
    } else {
      for (i = 0; i < row.length; i++) {
        coordinates.push([
          subxoffset,
          subyoffset,
          subxoffset + row[i] / areaheight,
          subyoffset + areaheight,
        ]);
        subxoffset = subxoffset + row[i] / areaheight;
      }
    }
    return coordinates;
  };

  // cutArea - once we've placed some boxes into an row we then need to identify the remaining area,
  //           this function takes the area of the boxes we've placed and calculates the location and
  //           dimensions of the remaining space and returns a container box defined by the remaining area
  this.cutArea = function(area: number) {
    var newcontainer;

    if (this.width >= this.height) {
      var areawidth = area / this.height;
      var newwidth = this.width - areawidth;
      newcontainer = Container(
        this.xoffset + areawidth,
        this.yoffset,
        newwidth,
        this.height,
      );
    } else {
      var areaheight = area / this.width;
      var newheight = this.height - areaheight;
      newcontainer = Container(
        this.xoffset,
        this.yoffset + areaheight,
        this.width,
        newheight,
      );
    }
    return newcontainer;
  };
}
