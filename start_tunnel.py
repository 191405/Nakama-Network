from pyngrok import ngrok
import time
import sys

# Connect to port 8000
try:
    public_url = ngrok.connect(8000).public_url
    print(f"NGROK_URL={public_url}")
    sys.stdout.flush()
    # Keep the script running
    while True:
        time.sleep(1)
except Exception as e:
    print(f"Error: {e}")
