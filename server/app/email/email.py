import os
from dotenv import load_dotenv
from .sendemail import GmailClient

load_dotenv()

def send_interview_email(interview_data):
    gmail = GmailClient(
        access_token = os.getenv("GMAIL_ACCESS_TOKEN"),
        refresh_token = os.getenv("GMAIL_REFRESH_TOKEN"),
        client_id = os.getenv("GMAIL_CLIENT_ID"),
        client_secret = os.getenv("GMAIL_CLIENT_SECRET"),
        token_uri = os.getenv("GMAIL_TOKEN_URI") or "https://oauth2.googleapis.com/token"
    )
    gmail.send_interview_email(interview_data)