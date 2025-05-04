import os
from dotenv import load_dotenv
from .sendemail import GmailClient

load_dotenv()
gmail = GmailClient(
        access_token = os.getenv("GMAIL_ACCESS_TOKEN"),
        refresh_token = os.getenv("GMAIL_REFRESH_TOKEN"),
        client_id = os.getenv("GMAIL_CLIENT_ID"),
        client_secret = os.getenv("GMAIL_CLIENT_SECRET"),
        token_uri = os.getenv("GMAIL_TOKEN_URI") or "https://oauth2.googleapis.com/token"
    )
def send_interview_email(interview_data):
    gmail.send_interview_email(interview_data)
def send_rejection_email(data):
    gmail.send_rejection_email(data)
def send_acceptance_email(data):
    gmail.send_acceptance_email(data)