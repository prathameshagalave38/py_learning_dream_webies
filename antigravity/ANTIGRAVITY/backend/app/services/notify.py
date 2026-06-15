import logging

logger = logging.getLogger("tribal_marketplace_notifications")
logging.basicConfig(level=logging.INFO)

def send_email_notification(to_email: str, subject: str, body: str) -> bool:
    """
    Simulates sending an email by printing to the server logs.
    """
    separator = "=" * 60
    email_log = f"\n{separator}\n[MOCK EMAIL SENT]\nTo: {to_email}\nSubject: {subject}\nBody:\n{body}\n{separator}\n"
    logger.info(email_log)
    return True

def send_sms_notification(to_phone: str, message: str) -> bool:
    """
    Simulates sending an SMS by printing to the server logs.
    """
    separator = "-" * 60
    sms_log = f"\n{separator}\n[MOCK SMS SENT]\nTo: {to_phone or 'No phone registered'}\nMessage: {message}\n{separator}\n"
    logger.info(sms_log)
    return True
