/**
 * Utility functions for exporting data to Excel format
 * Supports multiple data types across dashboard pages
 */

export interface ExportData {
  title: string;
  data: any[];
  columns: string[];
}

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data: ExportData): string => {
  const { title, data: rows, columns } = data;
  
  // Create header with title
  let csv = `${title}\n\n`;
  
  // Add column headers
  csv += columns.map(col => `"${col}"`).join(',') + '\n';
  
  // Add data rows
  rows.forEach(row => {
    const rowValues = columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '""';
      if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += rowValues.join(',') + '\n';
  });
  
  return csv;
};

/**
 * Trigger download of CSV file
 */
export const downloadCSV = (csv: string, filename: string) => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute('download', `${filename}.csv`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Export guests to CSV
 */
export const exportGuestsToCSV = (guests: any[]) => {
  const columns = ['Name', 'Email', 'Phone', 'Meal Preference', 'RSVP Status', 'Plus Ones'];
  const data = guests.map(guest => ({
    'Name': guest.name || '',
    'Email': guest.email || '',
    'Phone': guest.phone || '',
    'Meal Preference': guest.mealPreference || 'Not specified',
    'RSVP Status': guest.rsvpStatus || 'Not responded',
    'Plus Ones': guest.plusOnes || 0,
  }));
  
  const csv = convertToCSV({
    title: 'Guest List - ' + new Date().toLocaleDateString(),
    data,
    columns
  });
  
  downloadCSV(csv, `guests-${Date.now()}`);
};

/**
 * Export budget to CSV
 */
export const exportBudgetToCSV = (budget: any[]) => {
  const columns = ['Category', 'Amount', 'Spent', 'Remaining', 'Percentage'];
  const data = budget.map(item => ({
    'Category': item.category || '',
    'Amount': `$${item.amount || 0}`,
    'Spent': `$${item.spent || 0}`,
    'Remaining': `$${(item.amount - item.spent) || 0}`,
    'Percentage': `${Math.round((item.spent / item.amount) * 100) || 0}%`,
  }));
  
  const csv = convertToCSV({
    title: 'Budget Summary - ' + new Date().toLocaleDateString(),
    data,
    columns
  });
  
  downloadCSV(csv, `budget-${Date.now()}`);
};

/**
 * Export to-dos to CSV
 */
export const exportTodosToCSV = (todos: any[]) => {
  const columns = ['Task', 'Status', 'Priority', 'Due Date', 'Assigned To'];
  const data = todos.map(todo => ({
    'Task': todo.title || '',
    'Status': todo.completed ? 'Completed' : 'Pending',
    'Priority': todo.priority || 'Normal',
    'Due Date': todo.dueDate || 'Not set',
    'Assigned To': todo.assignedTo || 'Not assigned',
  }));
  
  const csv = convertToCSV({
    title: 'To-Do List - ' + new Date().toLocaleDateString(),
    data,
    columns
  });
  
  downloadCSV(csv, `todos-${Date.now()}`);
};

/**
 * Export vendors to CSV
 */
export const exportVendorsToCSV = (vendors: any[]) => {
  const columns = ['Name', 'Category', 'Rating', 'Phone', 'Website', 'Estimated Cost'];
  const data = vendors.map(vendor => ({
    'Name': vendor.name || '',
    'Category': vendor.category || '',
    'Rating': vendor.rating ? `${vendor.rating}/5` : 'Not rated',
    'Phone': vendor.phone || '',
    'Website': vendor.website || '',
    'Estimated Cost': vendor.estimatedCost ? `$${vendor.estimatedCost}` : 'Not specified',
  }));
  
  const csv = convertToCSV({
    title: 'Vendor List - ' + new Date().toLocaleDateString(),
    data,
    columns
  });
  
  downloadCSV(csv, `vendors-${Date.now()}`);
};

/**
 * Export music/playlist to CSV
 */
export const exportPlaylistToCSV = (playlist: any[]) => {
  const columns = ['Song Title', 'Artist', 'Duration', 'Category', 'Ceremony Moment'];
  const data = playlist.map(song => ({
    'Song Title': song.title || '',
    'Artist': song.artist || '',
    'Duration': song.duration || '0:00',
    'Category': song.category || 'General',
    'Ceremony Moment': song.ceremonyMoment || 'Not assigned',
  }));
  
  const csv = convertToCSV({
    title: 'Playlist - ' + new Date().toLocaleDateString(),
    data,
    columns
  });
  
  downloadCSV(csv, `playlist-${Date.now()}`);
};

/**
 * Export seating chart to Excel (.xlsx) format
 * Creates a workbook with one sheet per table
 */
export const exportSeatingToExcel = (tables: any[]) => {
  const XLSX = require('xlsx');
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create summary sheet
  const summaryData = tables.map((table, index) => ({
    'Table #': index + 1,
    'Table Name': table.name,
    'Capacity': table.capacity,
    'Guests Assigned': table.guests?.length || 0,
    'Empty Seats': (table.capacity - (table.guests?.length || 0)),
    'Guest Names': table.guests?.map((g: any) => g.name).join('; ') || ''
  }));
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 8 },  // Table #
    { wch: 15 }, // Table Name
    { wch: 10 }, // Capacity
    { wch: 15 }, // Guests Assigned
    { wch: 12 }, // Empty Seats
    { wch: 40 }  // Guest Names
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Seating Summary');
  
  // Create individual sheet for each table
  tables.forEach((table, index) => {
    const tableData = (table.guests || []).map((guest: any, guestIndex: number) => ({
      'Seat #': guestIndex + 1,
      'Guest Name': guest.name,
      'Notes': ''
    }));
    
    // Add empty rows for empty seats
    const emptySeats = (table.capacity - (table.guests?.length || 0));
    for (let i = 0; i < emptySeats; i++) {
      tableData.push({
        'Seat #': (table.guests?.length || 0) + i + 1,
        'Guest Name': '',
        'Notes': ''
      });
    }
    
    const sheet = XLSX.utils.json_to_sheet(tableData);
    sheet['!cols'] = [
      { wch: 10 }, // Seat #
      { wch: 25 }, // Guest Name
      { wch: 30 }  // Notes
    ];
    
    XLSX.utils.book_append_sheet(workbook, sheet, `${table.name || `Table ${index + 1}`}`);
  });
  
  // Save the workbook
  XLSX.writeFile(workbook, `seating-chart-${Date.now()}.xlsx`);
};

/**
 * Export seating chart to CSV (legacy)
 */
export const exportSeatingToCSV = (seatingData: any) => {
  const columns = ['Table Number', 'Guests', 'Total Seats', 'Notes'];
  const data = Object.entries(seatingData).map(([tableNum, guests]: any) => ({
    'Table Number': tableNum,
    'Guests': Array.isArray(guests) ? guests.join(', ') : guests,
    'Total Seats': Array.isArray(guests) ? guests.length : 1,
    'Notes': '',
  }));
  
  const csv = convertToCSV({
    title: 'Seating Chart - ' + new Date().toLocaleDateString(),
    data,
    columns
  });
  
  downloadCSV(csv, `seating-${Date.now()}`);
};
