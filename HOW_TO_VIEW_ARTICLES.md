# How to View Your Articles on the Frontpage

## Important: Access Through the Server

**You MUST access the website through the server, not by opening the HTML file directly!**

### ❌ Wrong Way (Won't Show Articles):
- Double-clicking `index.html`
- Opening `file:///C:/Users/patri/Desktop/SportAgency/index.html`
- This won't work because API calls don't work from `file://` protocol

### ✅ Correct Way (Will Show Articles):
1. **Start the server:**
   ```bash
   npm start
   ```
   Or:
   ```bash
   node server.js
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3005
   ```
   (Use the port number shown in your server console - it's 3005 based on your .env file)

3. **Your articles will appear in the "News & Insights" section**

## Requirements for Articles to Show

1. **Article must be Published:**
   - When creating/editing an article in the admin panel
   - Make sure the "Published" checkbox is checked ✅
   - Draft articles won't show on the frontpage

2. **Server must be running:**
   - The API endpoint `/api/news?published=true` must be accessible
   - Check the server console for any errors

3. **Database must have published articles:**
   - Go to admin panel: `http://localhost:3005/admin`
   - Check if you have articles marked as "Published"

## Troubleshooting

### Articles Still Not Showing?

1. **Check Browser Console (F12):**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages
   - You should see: "Loaded news from API: X articles"

2. **Check Network Tab:**
   - In Developer Tools, go to Network tab
   - Refresh the page
   - Look for `/api/news?published=true&limit=4`
   - Check if it returns 200 OK and shows your articles

3. **Verify Articles are Published:**
   - Go to admin panel
   - Check if articles have "Published" badge
   - If they show "Draft", click Edit and check the "Published" checkbox

4. **Check Server Console:**
   - Make sure server is running
   - Look for "MySQL Connected" and "Database synced"
   - Check for any error messages

5. **Test API Directly:**
   - Open: `http://localhost:3005/api/news?published=true`
   - You should see a JSON array of your published articles

## Quick Test

1. Start server: `npm start`
2. Create a test article in admin panel
3. Make sure "Published" is checked
4. Save the article
5. Go to: `http://localhost:3005`
6. Scroll to "News & Insights" section
7. Your article should appear!

