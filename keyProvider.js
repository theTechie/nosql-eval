var Keys = [];

function init(startRange, numOfKeys) {
  var endRange = startRange + numOfKeys;
  
  for (var i = startRange; i < endRange; i++) {
    Keys.push(i);
  }
}

// NOTE: del = true; will return unique keys randomly
function getKey(del) {
  var index = Math.floor(Math.random() * Keys.length);
  if (del) {
    return Keys.splice(index, 1)[0];
  }
  return Keys[index];
}

module.exports = {
  init: init,
  getKey: getKey
};