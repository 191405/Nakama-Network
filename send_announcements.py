import requests
import time
import sys

def send_announcement_to_all():
    # CUSTOMIZE YOUR ANNOUNCEMENT HERE:
    SUBJECT = "A New Era for Nakama Network! 🚀"
    MESSAGE_HTML = """
    <p>We've just pushed a massive stability update to the Network!</p>
    <ul>
        <li><strong>Fixed Logins:</strong> Password rules are now perfectly relaxed to accept all special characters.</li>
        <li><strong>Instant Access:</strong> Real-time search debouncing means the Anime Library is faster than ever.</li>
        <li><strong>New Features:</strong> Keep an eye out for our upcoming global ranking events!</li>
    </ul>
    <p>Jump back in and explore the hidden layer of anime.</p>
    """

    firestore_url = "https://firestore.googleapis.com/v1/projects/nk-network-project/databases/(default)/documents/users"
    
    print("Fetching users from Firestore...")
    response = requests.get(firestore_url)
    
    if response.status_code != 200:
        print(f"Failed to fetch users: {response.text}")
        return
        
    data = response.json()
    documents = data.get('documents', [])
    
    print(f"Found {len(documents)} users. Sending announcements...")
    
    sent_count = 0
    for doc in documents:
        fields = doc.get('fields', {})
        
        email_field = fields.get('email', {}).get('stringValue')
        name_field = fields.get('displayName', {}).get('stringValue', 'Nakama')
        
        if email_field:
            print(f"Sending announcement to {email_field} ({name_field})...")
            try:
                # Trigger backend announcement route
                # Using localhost since that's where the valid .env is for this quick one-off
                res = requests.post(
                    "http://localhost:8000/auth/announcement",
                    json={
                        "email": email_field, 
                        "display_name": name_field,
                        "subject": SUBJECT,
                        "message": MESSAGE_HTML
                    }
                )
                if res.status_code == 200:
                    print("  Success")
                    sent_count += 1
                else:
                    print(f"  Failed: {res.status_code} - {res.text}")
            except Exception as e:
                print(f"  Error: {e}")
                
            time.sleep(1.5) # Prevent rate limiting
            
    print(f"\nFinished! Successfully sent {sent_count} announcement emails.")

if __name__ == "__main__":
    send_announcement_to_all()
