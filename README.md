# Smart Public Complaint & Traffic Reporting System

A Flask-based web application for submitting, managing, and visualizing public complaints and traffic-related reports.

## 🚀 Quick Start (VS Code)

1. **Open in VS Code:**
   - Open VS Code
   - File → Open Folder → Select `smart-complaint-system` folder

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application:**
   ```bash
   python app.py
   ```

4. **Access the App:**
   - Open browser: `http://localhost:5000`
   - Admin login: `admin` / `admin123`

## 📋 Features

- **Home Page:** Welcome & navigation
- **Submit Complaints:** Form with name, email, location, coordinates, description, image upload
- **View Complaints:** List all submissions with status tracking
- **Interactive Map:** Leaflet.js map showing complaint locations
- **Admin Panel:** Login-protected management interface
- **Responsive Design:** Bootstrap 5 styling
- **SQLite Database:** Automatic database creation

## 🗂️ Project Structure

```
smart-complaint-system/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies  
├── README.md                   # This file
├── static/
│   ├── css/style.css          # Custom styles
│   ├── js/map.js              # Map functionality
│   ├── images/                # Static images
│   └── uploads/               # User uploads
└── templates/
    ├── base.html              # Base template
    ├── home.html              # Home page
    ├── submit_complaint.html   # Complaint form
    ├── view_complaints.html    # View all complaints
    ├── traffic_map.html        # Interactive map
    ├── admin_login.html        # Admin login
    └── admin_panel.html        # Admin dashboard
```

## 🔧 Development

- **Database:** SQLite (auto-created as `complaints.db`)
- **File Uploads:** Saved to `static/uploads/`
- **Admin Credentials:** Change in `app.py` for production
- **Debug Mode:** Enabled by default

## 📝 Usage

1. **Submit Complaints:** Fill form with location details
2. **View Status:** Check complaint resolution progress  
3. **Map Visualization:** See complaints plotted by coordinates
4. **Admin Management:** Update complaint status via admin panel

Built with Flask, Bootstrap 5, Leaflet.js, and SQLite.