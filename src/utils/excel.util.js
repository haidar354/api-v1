import readXlsxFile from 'read-excel-file/node';
import { join } from 'path';

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
