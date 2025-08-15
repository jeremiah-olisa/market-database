// Import and re-export pool for convenience
import pool from './pool.js';
export { pool };

/**
 * Generates SQL placeholders for bulk insert operations
 * @param {Array} dataArray - Array of data objects
 * @param {number} columnsPerRow - Number of columns per row
 * @returns {Object} Object containing placeholders string and values array
 */
export function generatePlaceholders(dataArray, columnsPerRow) {
  // Generate placeholders dynamically
  const placeholders = dataArray
    .map((_, index) => {
      const start = index * columnsPerRow + 1;
      const params = Array.from({ length: columnsPerRow }, (_, i) => `$${start + i}`);
      return `(${params.join(", ")})`;
    })
    .join(", ");

  return { placeholders };
}

/**
 * Extracts values from data array for SQL insertion
 * @param {Array} dataArray - Array of data objects
 * @param {Array} fieldNames - Array of field names to extract
 * @returns {Array} Flattened array of values
 */
export function extractValues(dataArray, fieldNames) {
  return dataArray.flatMap((item) => 
    fieldNames.map(fieldName => item[fieldName])
  );
}

/**
 * Generates complete SQL insert data (placeholders + values)
 * @param {Array} dataArray - Array of data objects
 * @param {Array} fieldNames - Array of field names to extract
 * @returns {Object} Object containing placeholders string and values array
 */
export function generateInsertData(dataArray, fieldNames) {
  const { placeholders } = generatePlaceholders(dataArray, fieldNames.length);
  const values = extractValues(dataArray, fieldNames);
  
  return { placeholders, values };
} 