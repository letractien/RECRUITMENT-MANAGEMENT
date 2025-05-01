from pymongo import MongoClient
import base64
import os
import re
import mimetypes
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from datetime import datetime

class GmailClient:
    def __init__(self, access_token, refresh_token, client_id, client_secret, token_uri):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_uri = token_uri
        self.service = self._authenticate()

    def _authenticate(self):
        creds = Credentials(
            token=self.access_token,
            refresh_token=self.refresh_token,
            client_id=self.client_id,
            client_secret=self.client_secret,
            token_uri=self.token_uri
        )
        if creds.expired:
            creds.refresh(Request())
        return build("gmail", "v1", credentials=creds)


    def send_interview_email(self, interview_data):
        """
        Gửi email thông báo lịch phỏng vấn cho ứng viên
        
        Args:
            interview_data (dict): Thông tin cuộc phỏng vấn dưới dạng dictionary
        """
        # Trích xuất dữ liệu từ input
        candidate_email = interview_data.get('candidate_email')
        scheduled_date = interview_data.get('scheduled_date')
        location = interview_data.get('location')
        duration_minutes = interview_data.get('duration_minutes')
        interview_type = interview_data.get('type')
        description = interview_data.get('description')
        
        # Định dạng ngày giờ
        try:
            # scheduled_date đã là đối tượng datetime
            formatted_date = scheduled_date.strftime("%d/%m/%Y")
            formatted_time = scheduled_date.strftime("%H:%M")
        except Exception as e:
            print(f"Lỗi khi xử lý ngày giờ: {e}")
            formatted_date = str(scheduled_date)
            formatted_time = ""
        # Tạo tiêu đề email
        subject = f"Thư mời phỏng vấn - {formatted_date}"
        
        # Tạo nội dung email
        email_content = f"""
        <html>
        <body>
            <p>Kính gửi ứng viên,</p>
            
            <p>Chúng tôi vui mừng thông báo rằng hồ sơ của bạn đã được xem xét và mời bạn tham gia buổi phỏng vấn.</p>
            
            <p><strong>Thông tin chi tiết:</strong></p>
            <ul>
                <li>Ngày: {formatted_date}</li>
                <li>Thời gian: {formatted_time}</li>
                <li>Thời lượng: {duration_minutes} phút</li>
                <li>Địa điểm: {location}</li>
                <li>Hình thức: {interview_type.capitalize()}</li>
            </ul>
            
            {f"<p><strong>Mô tả thêm:</strong> {description}</p>" if description else ""}
            
            <p>Vui lòng xác nhận sự tham dự của bạn bằng cách trả lời email này.</p>
            
            <p>Trân trọng,<br>
            Phòng Nhân sự</p>
        </body>
        </html>
        """
        
        # Tạo đối tượng email
        mime_message = EmailMessage()
        mime_message["To"] = candidate_email
        mime_message["From"] = "tinle210303@gmail.com"
        mime_message["Subject"] = subject
        mime_message.add_alternative(email_content, subtype="html")
        
        # Mã hóa và gửi email
        encoded_message = base64.urlsafe_b64encode(mime_message.as_bytes()).decode()
        body = {"raw": encoded_message}
        
        try:
            self.service.users().messages().send(userId="me", body=body).execute()
            print(f"✅ Email phỏng vấn đã được gửi thành công đến {candidate_email}!")
            return True
        except Exception as error:
            print(f"❌ Lỗi khi gửi email phỏng vấn: {error}")
            return False

