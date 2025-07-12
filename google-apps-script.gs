// Google Apps Script to serve Form data as JSON
// Deploy this as a web app to get your endpoint URL

// Configuration
const FORM_RESPONSES_SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID_HERE'; // Replace with your Google Form responses spreadsheet ID

function doGet() {
  try {
    // Set CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Get data from Forms
    const data = {
      stories: getStoriesFromForms(),
      timestamp: new Date().toISOString()
    };
    
    output.setContent(JSON.stringify(data));
    return output;
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}



function getStoriesFromForms() {
  try {
    const spreadsheet = SpreadsheetApp.openById(FORM_RESPONSES_SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0]; // First sheet (Form responses)
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) return []; // No data or only headers
    
    const headers = data[0];
    console.log('Spreadsheet headers:', headers);
    const stories = [];
    
    // Process each row (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const story = {};
      
      // Map form fields to story properties based on your actual spreadsheet headers
      story.id = i;
      story.timestamp = row[0]; // Timestamp column
      
      // Debug: Log the name value to see what's actually in the column
      const nameValue = row[1];
      console.log(`Row ${i}: Name value = "${nameValue}"`);
      
      story.name = nameValue || 'Anonymous'; // "Your name" column
      story.content = row[2] || ''; // "Your thoughts/ stories/ incidents with Kabir" column
      story.mediaUrl = row[3] || ''; // "Please upload anything of Kabir" column (URL)
      // Check visibility - handle empty cells and different possible values
      const visibilityValue = row[4] || '';
      story.visible = visibilityValue.toLowerCase().includes('yes') || visibilityValue === ''; // Default to visible if empty
      
      // Generate a title from the content if none provided
      story.title = generateTitle(story.content);
      
      // Only include stories that are marked as visible (or have empty visibility field)
      if (story.visible) {
        stories.push(story);
      }
    }
    
    return stories;
  } catch (error) {
    console.error('Error getting stories:', error);
    return [];
  }
}

// Optional: Set up triggers to automatically update when new form responses are added
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger for form submissions
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.openById(FORM_RESPONSES_SPREADSHEET_ID))
    .onFormSubmit()
    .create();
}

function onFormSubmit(e) {
  // This function runs when new form responses are submitted
  console.log('New form submission:', e);
  // You can add notification logic here
}

// Function to generate a title from story content
function generateTitle(content) {
  if (!content || content.trim() === '') return 'Untitled';
  
  // Use first sentence, or first 8 words if no period
  let firstSentence = content.split(/[.?!]/)[0];
  if (firstSentence.length < 4) firstSentence = content;
  
  let words = firstSentence.trim().split(/\s+/);
  if (words.length > 8) {
    return words.slice(0, 8).join(' ') + '...';
  }
  return firstSentence.trim();
}

// Test function to verify setup
function testSetup() {
  console.log('Testing Form integration...');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(FORM_RESPONSES_SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    console.log('Total rows in spreadsheet:', data.length);
    console.log('Headers:', data[0]);
    
    if (data.length > 1) {
      console.log('First data row:', data[1]);
      console.log('Visibility value (column 4):', data[1][4]);
    }
    
    const stories = getStoriesFromForms();
    console.log('Found visible stories:', stories.length);
    
    return {
      totalRows: data.length,
      stories: stories.length,
      headers: data[0]
    };
  } catch (error) {
    console.error('Error in testSetup:', error);
    return { error: error.toString() };
  }
} 