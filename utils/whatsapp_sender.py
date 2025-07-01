import requests
import json

class WhatsAppSender:
    def __init__(self, api_url, token):
        self.api_url = api_url
        self.token = token

    def send_message(self, phone_number, message, attachment_path=None):
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        data = {
            "phone": phone_number,
            "message": message
        }
        if attachment_path:
            data["attachment"] = attachment_path

        response = requests.post(self.api_url, headers=headers, data=json.dumps(data))
        return response.status_code == 200
