# Admin Dashboard - Quick Guide for Viewing and Managing Student Results

## Accessing Student Results

### Step 1: Login to Admin Dashboard
1. Navigate to the application
2. Click on "Teacher/Admin Login"
3. Enter your admin credentials:
   - Email: `admin@gmis.edu.ng`
   - Password: `admin123`
4. Click "Login"

### Step 2: Navigate to View Results
1. Once logged in, you'll see three tabs at the top:
   - Add Question
   - View Questions
   - **View Results** ← Click this tab

## Managing Student Results

### Viewing All Results
When you click on "View Results", you'll see a table with all student exam results showing:
- Student Name
- School ID
- Subject(s) taken
- Score (e.g., 45/60)
- Percentage (e.g., 75.0%)
- Grade (A, B, C, D, or F) with color coding:
  - 🟢 Green = A (Excellent)
  - 🔵 Blue = B (Very Good)
  - 🟡 Yellow = C (Good)
  - 🟠 Orange = D (Fair)
  - 🔴 Red = F (Needs Improvement)
- Date Completed
- Action buttons

### Downloading All Results as CSV
1. At the top right of the results table, click **"Download CSV"**
2. A CSV file will be automatically downloaded to your computer
3. The filename will include the current date (e.g., `exam-results-2026-01-28.csv`)
4. Open the file in Excel, Google Sheets, or any spreadsheet application
5. Use it for:
   - Record keeping
   - Data analysis
   - Reporting to school administration
   - Creating charts and graphs

### Viewing Individual Student Result Details
1. Find the student's result in the table
2. In the "Actions" column, click the **eye icon (👁️)**
3. You'll see a detailed view showing:
   - Complete student information
   - Exam type and subject(s)
   - Large score display
   - Percentage with visual indicator
   - Grade with description
   - Performance summary with:
     - Correct answers
     - Incorrect answers
     - Success rate
4. Click **"← Back to Results"** to return to the list

### Printing Student Results
There are two ways to print a student's result:

#### Method 1: Quick Print from Results Table
1. Find the student's result in the table
2. In the "Actions" column, click the **printer icon (🖨️)**
3. The browser's print dialog will open automatically
4. Choose your printer or "Save as PDF"
5. Click "Print"

#### Method 2: Print from Detailed View
1. Click the eye icon to view the student's detailed result
2. At the top right, click the **"Print"** button
3. The browser's print dialog will open
4. Choose your printer or "Save as PDF"
5. Click "Print"

### What Gets Printed
The printed result includes:
- School logo and name (Great Model International School)
- "Official Exam Result" header
- Student's full name and School ID
- Exam type (Common Entrance, WAEC, or JAMB)
- Subject(s) taken
- Date completed
- Score (large, easy to read)
- Percentage
- Grade with description
- Performance summary
- Official footer with print date

## Tips for Best Results

### For Printing:
- Use A4 paper size for best results
- Print in color to preserve grade color coding
- Use "Save as PDF" to create digital copies
- Keep printed results in student files

### For CSV Export:
- Download regularly to maintain backup records
- Use Excel/Sheets filters to analyze by:
  - Subject
  - Grade
  - Date range
  - Score range
- Create pivot tables for statistical analysis
- Generate charts to visualize performance trends

### For Record Keeping:
- Print results immediately after exams
- Store in student portfolios
- Share with parents during meetings
- Keep digital copies (PDF) for easy access
- Maintain CSV backups for data analysis

## Common Use Cases

### 1. Parent-Teacher Meeting
- View the student's detailed result
- Print a copy to share with parents
- Discuss performance summary
- Identify areas for improvement

### 2. End of Term Reports
- Download CSV of all results
- Filter by date range
- Generate class statistics
- Create performance reports

### 3. Student Records
- Print individual results
- File in student portfolios
- Maintain digital copies
- Track progress over time

### 4. Administrative Reporting
- Export CSV for school reports
- Analyze pass rates
- Identify trends
- Report to school board

## Troubleshooting

### Print Dialog Doesn't Open
- Check if pop-ups are blocked in your browser
- Allow pop-ups for this site
- Try using the Print button from the detailed view

### CSV Download Doesn't Start
- Check your browser's download settings
- Ensure downloads are not blocked
- Check your Downloads folder

### Results Not Showing
- Ensure students have completed exams
- Refresh the page
- Check that you're logged in as admin

## Security Note
Only authorized admin/teacher accounts can access student results. Always log out when finished to protect student privacy.

## Real-time question updates
- The system now fetches questions from the MongoDB-backed API when a subject is requested so newly added questions are available immediately to other users.
- When an admin adds or deletes a question from the dashboard, the app broadcasts a lightweight message (`BroadcastChannel`) to open tabs to reload their question cache. For cross-device updates where BroadcastChannel is not available, you can enable server polling by setting `NEXT_PUBLIC_POLL_QUESTIONS=true` (polls every ~15s).

## Need Help?
Contact the system administrator if you encounter any issues or need additional features.
