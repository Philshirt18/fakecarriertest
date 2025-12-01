# FakeCarrier Outlook Add-in

This is a sideloadable Outlook add-in that allows users to scan emails directly from Outlook.

## Prerequisites

- Outlook Desktop (Windows or Mac) or Outlook on the web
- FakeCarrier API running (default: http://localhost:8000)
- Web app running to serve add-in files (default: http://localhost:3000)

## Setup Instructions

### Option 1: Sideload in Outlook Desktop (Windows)

1. Save the `manifest.xml` file to a network share or local folder
2. Open Outlook Desktop
3. Go to **File** > **Get Add-ins**
4. Click **My add-ins** in the left sidebar
5. Scroll down and click **Add a custom add-in** > **Add from file**
6. Browse to your `manifest.xml` file and click **Open**
7. Click **Install** in the warning dialog

### Option 2: Sideload in Outlook Desktop (Mac)

1. Save the `manifest.xml` file to a local folder
2. Open Outlook for Mac
3. Click the **Get Add-ins** button in the ribbon
4. Click **My add-ins** tab
5. Click **Add a custom add-in** at the bottom
6. Click **Add from file**
7. Browse to your `manifest.xml` file and click **Open**
8. Click **Install**

### Option 3: Sideload in Outlook on the Web

1. Open Outlook on the web (https://outlook.office.com or https://outlook.office365.com)
2. Open any email message
3. Click the **...** (More actions) button
4. Select **Get Add-ins**
5. Click **My add-ins** in the left sidebar
6. Under **Custom add-ins**, click **Add a custom add-in** > **Add from file**
7. Upload your `manifest.xml` file
8. Click **Install**

## Using the Add-in

1. Open any email in Outlook
2. Look for the **FakeCarrier** section in the ribbon or click the add-in icon
3. Click **Scan Email** button
4. The task pane will open showing the scan button
5. Click **Scan This Email** to analyze the current email
6. View the risk level, score, and summary of findings

## Configuration

To change the API endpoint, edit the `API_BASE_URL` constant in `taskpane.html`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

For production deployment:
1. Update all URLs in `manifest.xml` to your production domain
2. Update `API_BASE_URL` in `taskpane.html`
3. Ensure HTTPS is used for production
4. Host the add-in files on a secure web server

## Troubleshooting

### Add-in doesn't appear
- Verify the manifest.xml file is valid XML
- Check that all URLs in the manifest are accessible
- Try clearing Office cache and reloading

### Scan fails
- Ensure the API is running and accessible
- Check browser console for CORS errors
- Verify the API_BASE_URL is correct

### CORS Issues
- The API must allow requests from the add-in domain
- Check CORS configuration in the FastAPI backend

## Development

To modify the add-in:
1. Edit `taskpane.html` for UI changes
2. Update `manifest.xml` for configuration changes
3. Reload the add-in in Outlook (close and reopen the task pane)

## Security Notes

- The add-in only reads email content (ReadItem permission)
- Email data is sent to the configured API endpoint
- Ensure API endpoint is trusted and secure
- Use HTTPS in production
