# Google Drive Integration Setup Guide

This guide will help you set up automatic story updates from a single Google Form to your website.

## Step 1: Set Up Google Form

1. **Create a Google Form** with these fields:
   - **Name** (Short answer) - Required
   - **Story Title** (Short answer) - Required
   - **Story Content** (Long answer) - Required
   - **Photo/Video Upload** (File upload) - Optional
   - **Make story visible on website** (Multiple choice: Yes/No) - Required
   - **Category** (Multiple choice: Memory, Tribute, Story, etc.) - Optional

2. **Get the responses spreadsheet ID**:
   - Open the form responses spreadsheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE`

## Step 2: Configure Form Settings

1. **Set file upload limits**:
   - In your form, click on the file upload question
   - Set maximum file size (recommend 10MB for photos, 100MB for videos)
   - Allow multiple file types: Images (JPG, PNG, GIF) and Videos (MP4, MOV)

2. **Set form permissions**:
   - Click "Settings" in your form
   - Enable "Collect email addresses" if you want to track who submitted
   - Set "Response destination" to your Google Sheet

## Step 3: Set Up Google Apps Script

1. **Go to [script.google.com](https://script.google.com)**
2. **Create a new project**
3. **Copy the code** from `google-apps-script.gs` into the editor
4. **Update the configuration**:
   ```javascript
   const FORM_RESPONSES_SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with actual spreadsheet ID
   ```

5. **Deploy as web app**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app"
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the web app URL

## Step 4: Update Your Website

1. **Update `google-drive-integration.js`**:
   ```javascript
   this.scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'; // Replace with your web app URL
   ```

2. **Add the integration script** to your HTML (already done in index.html)

## Step 5: Test the Integration

1. **Submit a test story** through your Google Form with:
   - Name: "Test User"
   - Story Title: "Test Story"
   - Story Content: "This is a test story to verify the integration works."
   - Photo/Video: Upload a test image
   - Make story visible: "Yes"
   - Category: "Memory"

2. **Refresh your website** - new story should appear automatically in the carousel

## Step 6: Customize the Form Structure

If your Google Form has different fields, update the `getStoriesFromForms()` function in the Apps Script:

```javascript
// Adjust these indices based on your form structure
story.timestamp = row[0]; // Timestamp column
story.name = row[1] || 'Anonymous'; // Name column
story.title = row[2] || 'Untitled'; // Story Title column
story.content = row[3] || ''; // Story Content column
story.mediaUrl = row[4] || ''; // Photo/Video URL column
story.visible = row[5] === 'Yes'; // Visibility column
story.category = row[6] || 'General'; // Category column
```

## Step 7: Set Up Auto-Refresh (Optional)

The website will automatically refresh content every 30 seconds. You can adjust this in `google-drive-integration.js`:

```javascript
formManager.startAutoRefresh(30000); // 30 seconds
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Apps Script web app is set to "Anyone" access
2. **No data showing**: Check the browser console for errors
3. **Form data not appearing**: Check the spreadsheet column order matches your form
4. **Media not loading**: Verify the uploaded files are accessible and URLs are correct

### Debug Steps:

1. **Test the Apps Script directly**:
   - Run the `testSetup()` function in the Apps Script editor
   - Check the logs for any errors

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for any JavaScript errors

3. **Verify URLs**:
   - Make sure all folder IDs and spreadsheet IDs are correct
   - Test the web app URL in a browser

## Security Considerations

1. **Form responses**: Make sure the responses spreadsheet is accessible
2. **Web app access**: Set to "Anyone" for public access
3. **File uploads**: Ensure uploaded media files are accessible via the generated URLs

## Advanced Features

### Story Approval System
Add approval logic in the Apps Script:

```javascript
// In getStoriesFromForms()
if (row[6] === 'Approved') { // Add approval column to your form
  stories.push(story);
}
```

### Real-time Updates
Set up Google Apps Script triggers for instant updates:

```javascript
// Run setupTriggers() in Apps Script
function setupTriggers() {
  // This will trigger onFormSubmit when new responses are submitted
}
```

### Caching
The system includes 5-minute caching to reduce API calls. Adjust in `google-drive-integration.js`:

```javascript
this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all IDs and URLs are correct
3. Test the Apps Script functions individually
4. Ensure proper permissions on form responses and uploaded files 