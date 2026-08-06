/**
 * Excel File Handling Utilities
 * Dynamically loads the `xlsx` library to minimize initial bundle size.
 */

// We don't import xlsx statically at the top level to avoid bundling it
// on the main chunk. It will be loaded on demand.
type WorkBook = import('xlsx').WorkBook;

/**
 * Dynamically imports xlsx and reads the workbook from a File.
 */
async function loadWorkbook(file: File): Promise<WorkBook> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  // Read the workbook. We don't need cell values just to get sheet names, 
  // but we do need them later for CSV conversion.
  return XLSX.read(buffer, { type: 'array' });
}

/**
 * Reads an Excel file and returns a list of non-empty sheet names.
 */
export async function readExcelSheets(file: File): Promise<string[]> {
  const workbook = await loadWorkbook(file);
  const validSheets: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // A sheet without a '!ref' property is considered empty by SheetJS
    if (sheet && sheet['!ref']) {
      validSheets.push(sheetName);
    }
  }

  return validSheets;
}

/**
 * Extracts a specific sheet from an Excel file and converts it into a CSV File object.
 * This generated CSV file can then be fed into the existing CSV parsing pipeline.
 */
export async function convertSheetToCSV(file: File, sheetName: string): Promise<File> {
  const XLSX = await import('xlsx');
  const workbook = await loadWorkbook(file);
  
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`La hoja "${sheetName}" no existe en el archivo.`);
  }

  // Convert to CSV string, forcing dates to be formatted strings, not raw numbers
  const csvString = XLSX.utils.sheet_to_csv(sheet, {
    raw: false, // Ensures dates are formatted as text, not serial numbers
    blankrows: false // Skip empty rows
  } as any);

  // Create a Blob and wrap it in a File object to mimic a real file upload
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Format: "FileName.xlsx - SheetName.csv"
  const virtualFileName = `${file.name} - ${sheetName}.csv`;
  
  return new File([blob], virtualFileName, {
    type: 'text/csv',
    lastModified: Date.now()
  });
}
