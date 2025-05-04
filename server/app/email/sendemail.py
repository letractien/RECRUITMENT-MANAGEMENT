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
    def send_acceptance_email(self, output):
        """
        Gửi email thông báo kết quả phỏng vấn cho ứng viên đã đậu
        
        Args:
            output (dict): Thông tin ứng viên và công việc dưới dạng dictionary
        """
        # Trích xuất dữ liệu từ input
        candidate_email = output.get('candidate', {}).get('email')
        position = output.get('job', {}).get('title', 'vị trí ứng tuyển')
        
        # Tạo tiêu đề email
        subject = f"Thông báo kết quả phỏng vấn - Chúc mừng bạn đã được nhận vào vị trí {position}"
        
        # Tạo nội dung email
        email_content = f"""
        <html>
        <body>
            <p>Kính gửi ứng viên,</p>
            
            <p>Chúng tôi vui mừng thông báo rằng bạn đã <strong>trúng tuyển</strong> vào vị trí {position} tại công ty chúng tôi.</p>
            
            <p>Trong thời gian tới, chúng tôi sẽ liên hệ với bạn để thông báo chi tiết về:</p>
            <ul>
                <li>Ngày bắt đầu làm việc</li>
                <li>Thông tin về lương và phúc lợi</li>
                <li>Các thủ tục và giấy tờ cần chuẩn bị</li>
            </ul>
            
            <p>Vui lòng xác nhận việc nhận công việc bằng cách trả lời email này trong vòng 3 ngày làm việc.</p>
            
            <p>Chúng tôi rất mong được làm việc cùng bạn!</p>
            
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
            print(f"✅ Email thông báo kết quả đậu phỏng vấn đã được gửi thành công đến {candidate_email}!")
            return True
        except Exception as error:
            print(f"❌ Lỗi khi gửi email thông báo kết quả đậu phỏng vấn: {error}")
            return False


    def send_rejection_email(self, output):
        """
        Gửi email thông báo kết quả phỏng vấn cho ứng viên không được tuyển
        
        Args:
            output (dict): Thông tin ứng viên và công việc dưới dạng dictionary
        """
        # Trích xuất dữ liệu từ input
        candidate_email = output.get('candidate', {}).get('email')
        position = output.get('job', {}).get('title', 'vị trí ứng tuyển')
        
        # Tạo tiêu đề email
        subject = f"Thông báo kết quả phỏng vấn - Vị trí {position}"
        
        # Tạo nội dung email
        email_content = f"""
        <html>
        <body>
            <p>Kính gửi ứng viên,</p>
            
            <p>Cảm ơn bạn đã tham gia buổi phỏng vấn cho vị trí {position} tại công ty chúng tôi.</p>
            
            <p>Sau khi cân nhắc kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng chúng tôi đã quyết định tiếp tục với các ứng viên khác phù hợp hơn với yêu cầu hiện tại của vị trí này.</p>
            
            <p>Mặc dù vậy, chúng tôi đánh giá cao kinh nghiệm và kỹ năng của bạn. Chúng tôi khuyến khích bạn tiếp tục theo dõi các cơ hội tuyển dụng trong tương lai tại công ty chúng tôi có thể phù hợp hơn với hồ sơ của bạn.</p>
            
            <p>Chúng tôi đánh giá cao thời gian và nỗ lực của bạn trong quá trình ứng tuyển và chúc bạn thành công trong sự nghiệp của mình.</p>
            
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
            print(f"✅ Email thông báo kết quả không được tuyển đã được gửi thành công đến {candidate_email}!")
            return True
        except Exception as error:
            print(f"❌ Lỗi khi gửi email thông báo kết quả không được tuyển: {error}")
            return False

