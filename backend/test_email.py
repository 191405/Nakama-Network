import os
import sys
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load .env
load_dotenv(".env")

smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT", 587))
smtp_user = os.getenv("SMTP_USER")
smtp_password = os.getenv("SMTP_PASSWORD")
smtp_email = os.getenv("SMTP_EMAIL")

print(f"SMTP Configuration:")
print(f"Host: {smtp_host}:{smtp_port}")
print(f"User: {smtp_user}")
print(f"Email: {smtp_email}")
print(f"Password set: {bool(smtp_password)}")

try:
    print("\nAttempting to connect to SMTP server...")
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.set_debuglevel(1)  # Show SMTP communication
    server.starttls()
    
    print("Attempting login...")
    server.login(smtp_user, smtp_password)
    print("Login successful! The credentials work.")
    
    # Try sending to the user's email if they want
    if len(sys.argv) > 1:
        target = sys.argv[1]
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = target
        msg['Subject'] = "Test from Backend"
        msg.attach(MIMEText("This is a test email.", 'plain'))
        server.send_message(msg)
        print(f"Test email sent to {target}")
        
    server.quit()
except Exception as e:
    print(f"\n❌ Error: {e}")
