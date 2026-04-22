import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, send_from_directory
from werkzeug.utils import secure_filename
import sqlite3
from datetime import datetime

# Configuration
UPLOAD_FOLDER = 'static/uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
DATABASE = 'complaints.db'
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin123'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'your-secret-key-change-in-production'

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        location TEXT,
        latitude REAL,
        longitude REAL,
        description TEXT,
        image TEXT,
        status TEXT DEFAULT 'Pending',
        timestamp TEXT
    )""")
    conn.commit()
    conn.close()
    print("📊 Database initialized")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

init_db()

# ROUTES

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/submit', methods=['GET', 'POST'])
def submit_complaint():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        location = request.form['location']
        latitude = request.form.get('latitude') or None
        longitude = request.form.get('longitude') or None
        description = request.form['description']

        image = request.files['image']
        image_path = ''
        if image and allowed_file(image.filename):
            filename = secure_filename(f"{datetime.now().strftime('%Y%m%d%H%M%S_')}{image.filename}")
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            image_path = image_path.replace('static/', '')

        conn = get_db_connection()
        conn.execute(
            'INSERT INTO complaints (name, email, location, latitude, longitude, description, image, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (name, email, location, latitude, longitude, description, image_path, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        conn.commit()
        conn.close()

        flash('Complaint submitted successfully!', 'success')
        return redirect(url_for('submit_complaint'))

    return render_template('submit_complaint.html')

@app.route('/complaints')
def view_complaints():
    conn = get_db_connection()
    complaints = conn.execute('SELECT * FROM complaints ORDER BY timestamp DESC').fetchall()
    conn.close()
    return render_template('view_complaints.html', complaints=complaints)

@app.route('/map')
def traffic_map():
    conn = get_db_connection()
    complaints = conn.execute('SELECT * FROM complaints WHERE latitude IS NOT NULL AND longitude IS NOT NULL').fetchall()
    conn.close()
    return render_template('traffic_map.html', complaints=complaints)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ADMIN ROUTES

@app.route('/admin', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            flash('Login successful!', 'success')
            return redirect(url_for('admin_panel'))
        else:
            flash('Invalid credentials!', 'danger')
    return render_template('admin_login.html')

@app.route('/admin/panel')
def admin_panel():
    if not session.get('admin_logged_in'):
        flash('Please login to access admin panel', 'warning')
        return redirect(url_for('admin_login'))

    conn = get_db_connection()
    complaints = conn.execute('SELECT * FROM complaints ORDER BY timestamp DESC').fetchall()
    conn.close()
    return render_template('admin_panel.html', complaints=complaints)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('Logged out successfully', 'info')
    return redirect(url_for('admin_login'))

@app.route('/admin/update/<int:complaint_id>', methods=['POST'])
def update_status(complaint_id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))

    new_status = request.form['status']
    conn = get_db_connection()
    conn.execute('UPDATE complaints SET status = ? WHERE id = ?', (new_status, complaint_id))
    conn.commit()
    conn.close()

    flash(f'Complaint #{complaint_id} status updated to: {new_status}', 'success')
    return redirect(url_for('admin_panel'))

# New route for deleting complaint

@app.route('/admin/delete/<int:complaint_id>', methods=['POST'])
def delete_complaint(complaint_id):
    if not session.get('admin_logged_in'):
        flash('Please login first.', 'warning')
        return redirect(url_for('admin_login'))

    conn = get_db_connection()
    complaint = conn.execute('SELECT image FROM complaints WHERE id = ?', (complaint_id,)).fetchone()
    if complaint and complaint['image']:
        image_path = os.path.join('static', complaint['image'])
        if os.path.exists(image_path):
            os.remove(image_path)
    conn.execute('DELETE FROM complaints WHERE id = ?', (complaint_id,))
    conn.commit()
    conn.close()

    flash(f'Complaint #{complaint_id} has been deleted.', 'success')
    return redirect(url_for('admin_panel'))

if __name__ == '__main__':
    print("🚀 Starting RESOLVE X...")
    print("📱 Access at: http://localhost:5000")
    print("🔐 Admin: admin / admin123")
    app.run(debug=True)
