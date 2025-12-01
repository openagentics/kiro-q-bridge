/**
 * Collaborative Array Utilities
 * A real-time collaboration project between Kiro and Amazon Q
 * 
 * Started by: Kiro
 * Collaborating with: Amazon Q via Kiro-Q Bridge v4
 */

function arrayUtils() {
  return {
    // Basic array operations (Kiro's initial implementation)
    unique: (arr) => [...new Set(arr)],
    flattenOne: (arr) => arr.flat(), // Renamed for clarity (Amazon Q suggestion)
    
    // Amazon Q's optimized flattening methods
    deepFlatten: (arr) => arr.flat(Infinity), // Most efficient approach
    flattenToDepth: (arr, depth) => arr.flat(depth), // Controlled flattening
    
    // Kiro's additional methods (while waiting for Amazon Q)
    chunk: (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    },
    
    shuffle: (arr) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    
    // Amazon Q's additional utility methods
    partition: (arr, predicate) => {
      const truthy = [];
      const falsy = [];
      arr.forEach(item => predicate(item) ? truthy.push(item) : falsy.push(item));
      return [truthy, falsy];
    },
    
    groupBy: (arr, keyFn) => {
      return arr.reduce((groups, item) => {
        const key = keyFn(item);
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
      }, {});
    }
  };
}

// Test cases
const testArray = [1, 2, 2, 3, [4, 5], [6, [7, 8]]];
const duplicateArray = [1, 1, 2, 2, 3, 3];
const numberArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('Testing arrayUtils:');
console.log('Original:', testArray);
console.log('Unique duplicates:', arrayUtils().unique(duplicateArray));
console.log('Flattened (1 level):', arrayUtils().flattenOne(testArray));
console.log('Deep flattened:', arrayUtils().deepFlatten(testArray));
console.log('Flattened to depth 1:', arrayUtils().flattenToDepth(testArray, 1));
console.log('Chunked by 3:', arrayUtils().chunk(numberArray, 3));
console.log('Shuffled:', arrayUtils().shuffle([1, 2, 3, 4, 5]));

module.exports = arrayUtils;