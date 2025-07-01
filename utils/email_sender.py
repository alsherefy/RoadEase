import smtplib
from email.message import EmailMessage

def send_email(receiver_email, subject, body, attachment_path=None, sender_email=None, sender_password=None):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.set_content(body)

    if attachment_path:
        with open(attachment_path, 'rb') as f:
            file_data = f.read()
            file_name = attachment_path.split('/')[-1]
        msg.add_attachment(file_data, maintype='application', subtype='octet-stream', filename=file_name)

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
