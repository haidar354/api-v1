import readXlsxFile from 'read-excel-file/node';
import { join } from 'path';

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return null;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Format time to HH:MM:SS format
 * @param {Date} date - JavaScript Date object (Excel time is stored as date)
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return null;
    }
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Check if a column name indicates it contains date data
 * @param {string} columnName - The column header name
 * @returns {boolean} True if column contains date data
 */
function isDateColumn(columnName) {
    const date_keywords = ['tanggal', 'date', 'tgl'];
    return date_keywords.some(keyword => 
        columnName.toLowerCase().includes(keyword.toLowerCase())
    );
}

/**
 * Check if a column name indicates it contains time data
 * @param {string} columnName - The column header name
 * @returns {boolean} True if column contains time data
 */
function isTimeColumn(columnName) {
    const time_keywords = ['waktu', 'time', 'jam'];
    return time_keywords.some(keyword => 
        columnName.toLowerCase().includes(keyword.toLowerCase())
    );
}

/**
 * Read Excel file and return data as array of objects
 * @param {string} filePath - Path to the Excel file (relative to public directory)
 * @returns {Promise<Array<Object>>} Array of objects representing Excel data
 */
export async function readExcel(filePath) {
    try {
        // Construct full path to the file
        const full_file_path = join(process.cwd(), 'public', filePath);
        
        // Read the Excel file
        const rows = await readXlsxFile(full_file_path);
        
        if (!rows || rows.length === 0) {
            throw new Error('Excel file is empty or could not be read');
        }
        
        // First row contains headers
        const headers = rows[0];
        
        if (!headers || headers.length === 0) {
            throw new Error('Excel file has no headers');
        }
        
        // Convert subsequent rows to objects using headers as keys
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const row_object = {};
            
            // Map each cell to its corresponding header
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                const cell_value = row[j];
                
                // Convert header to string and use as key
                const key = header ? String(header).trim() : `column_${j + 1}`;
                
                // Handle different cell value types
                if (cell_value === null || cell_value === undefined) {
                    row_object[key] = null;
                } else if (typeof cell_value === 'string') {
                    row_object[key] = cell_value.trim();
                } else if (cell_value instanceof Date) {
                    // Handle Date objects from Excel
                    if (isDateColumn(key)) {
                        // Format as date (YYYY-MM-DD)
                        row_object[key] = formatDate(cell_value);
                    } else if (isTimeColumn(key)) {
                        // Format as time (HH:MM:SS)
                        row_object[key] = formatTime(cell_value);
                    } else {
                        // Default: keep as is for other date columns
                        row_object[key] = cell_value;
                    }
                } else {
                    row_object[key] = cell_value;
                }
            }
            
            // Only add non-empty rows (at least one non-null value)
            const has_data = Object.values(row_object).some(value => 
                value !== null && value !== undefined && value !== ''
            );
            
            if (has_data) {
                data.push(row_object);
            }
        }
        
        return data;
        
    } catch (error) {
        throw new Error(`Failed to read Excel file: ${error.message}`);
    }
}
