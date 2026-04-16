
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

from app.config import settings

APP_NAME = "Nakama Network"
APP_URL = "https://nk-network-project.web.app"

def get_email_base_template(content: str, preheader: str = "") -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nakama Network</title>
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Preheader text (hidden) -->
        <div style="display: none; max-height: 0px; overflow: hidden;">
            {{preheader}}
        </div>
        
        <!-- Main container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Email card -->
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0f0f14; border-radius: 16px; border: 1px solid rgba(202, 138, 4, 0.2); overflow: hidden;">
                        
                        <!-- Header with logo -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #ca8a04 0%, #a16207 100%); padding: 30px; text-align: center;">
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">
                                    ⚔️ NAKAMA NETWORK
                                </h1>
                                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                                    The Ultimate Anime Community
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                {{content}}
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #050505; padding: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                                <p style="margin: 0 0 10px; color: #64748b; font-size: 12px;">
                                    &copy; {datetime.now().year} Nakama Network. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #475569; font-size: 11px;">
                                    You're receiving this because you're a member of Nakama Network.
                                </p>
                                <p style="margin: 15px 0 0;">
                                    <a href="{APP_URL}" style="color: #eab308; text-decoration: none; font-size: 12px;">Visit Nakama Network</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """.format(preheader=preheader, content=content)

class EmailService:
    def __init__(self):
        # Load from Settings object
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.smtp_email = settings.smtp_email
        
        self.is_configured = all([
            self.smtp_user, 
            self.smtp_password, 
            self.smtp_email
        ])
        
        if not self.is_configured:
            logger.warning("🔔 SMTP not fully configured. Email service running in MOCK mode.")

    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email via SMTP with fallback to logging"""
        if not self.is_configured:
            logger.info(f"💌 [MOCK EMAIL] To: {to_email} | Subject: {subject}")
            logger.debug(f"Content: {html_content[:100]}...")
            return True

        try:
            msg = MIMEMultipart()
            # Ensure the display name is clean or use the raw email
            sender_display = f"{APP_NAME} <{self.smtp_email}>"
            msg['From'] = sender_display
            msg['To'] = to_email
            msg['Subject'] = subject

            # Attach HTML content
            msg.attach(MIMEText(html_content, 'html'))

            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"✅ Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send email to {to_email}: {e}")
            return False

    def send_welcome_email(self, email: str, display_name: str) -> bool:
        """Send welcome email to new users with dramatic anime-style greeting"""
        content = f"""
        <h2 style="color: #eab308; margin-top: 0; font-size: 24px;">
            Welcome, {display_name}! 🔥
        </h2>
        
        <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">
            The gates have opened. You are now part of an elite community of anime warriors, 
            debaters, and legends from around the world.
        </p>
        
        <p style="font-size: 16px; line-height: 1.7; color: #cbd5e1;">
            Your journey to become a <strong style="color: #eab308;">Net God</strong> begins now.
        </p>
        
        <!-- Features box -->
        <div style="background-color: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #eab308;">
            <p style="margin: 0 0 15px; font-weight: bold; color: #fff; font-size: 16px;">
                🎮 Your Powers Await:
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">⚔️ <strong>Battle Arena</strong> - Debate epic matchups</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">🧠 <strong>Millionaire Trivia</strong> - Test your knowledge</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">🔮 <strong>The Oracle</strong> - AI anime recommendations</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">🏰 <strong>Clans</strong> - Build your team</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">📈 <strong>Ranking System</strong> - Rise through 13 tiers</td>
                </tr>
            </table>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="{APP_URL}" 
               style="background: linear-gradient(135deg, #eab308, #ca8a04);
                      color: white;
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      text-transform: uppercase;
                      display: inline-block;
                      letter-spacing: 1px;">
                Enter the Network →
            </a>
        </div>
        
        <p style="font-size: 14px; color: #94a3b8; text-align: center; font-style: italic;">
            "The bond between Nakama is unbreakable."
        </p>
        """
        
        full_html = get_email_base_template(content, preheader="Your journey begins now.")
        return self.send_email(email, "Welcome to Nakama Network! ⚔️", full_html)

    def send_verification_email(self, email: str, display_name: str, verification_url: str) -> bool:
        """Send email verification link"""
        content = f"""
        <h2 style="color: #eab308; margin-top: 0; font-size: 24px;">
            Almost There, {display_name}! ⚡
        </h2>
        
        <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">
            One step stands between you and full access to the Nakama Network. 
            Verify your email to unlock all features.
        </p>
        
        <!-- Verification code/link box -->
        <div style="background-color: rgba(234,179,8,0.1); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px solid rgba(234,179,8,0.3);">
            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 14px;">Click the button below to verify:</p>
            <a href="{verification_url}" 
               style="background: linear-gradient(135deg, #eab308, #ca8a04);
                      color: white;
                      padding: 14px 35px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 14px;
                      display: inline-block;">
                ✓ Verify Email
            </a>
        </div>
        
        <p style="font-size: 13px; color: #64748b; text-align: center;">
            This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
        """
        
        full_html = get_email_base_template(content, preheader="Verify your email to continue.")
        return self.send_email(email, "Verify Your Email ⚡", full_html)

    def send_password_reset_email(self, email: str, display_name: str, reset_url: str) -> bool:
        """Send password reset link"""
        content = f"""
        <h2 style="color: #eab308; margin-top: 0; font-size: 24px;">
            Password Reset Request 🔒
        </h2>
        
        <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">
            Hey {display_name}, we received a request to reset your password. 
            If this was you, click the button below:
        </p>
        
        <!-- Reset button -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="{reset_url}" 
               style="background: linear-gradient(135deg, #eab308, #ca8a04);
                      color: white;
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 14px;
                      display: inline-block;">
                Reset Password
            </a>
        </div>
        
        <div style="background-color: rgba(239,68,68,0.1); padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #fca5a5; font-size: 13px;">
                ⚠️ <strong>Security Notice:</strong> This link expires in 1 hour. 
                If you didn't request this, someone may be trying to access your account.
            </p>
        </div>
        """
        
        full_html = get_email_base_template(content, preheader="Reset your password.")
        return self.send_email(email, "Reset Your Password 🔒", full_html)

email_service = EmailService()


# ─── Convenience helpers (imported by routers) ────────────────────────────────

def send_feedback_received_email(user_email: str, feedback_text: str, display_name: str = "Nakama Member") -> bool:
    """Send a confirmation email when feedback is submitted."""
    content = f"""
    <h2 style="color: #eab308; margin-top: 0; font-size: 24px;">
        Feedback Received! 📬
    </h2>
    <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">
        Thank you, {display_name}! Your feedback has been received and our team will review it shortly.
    </p>
    <div style="background-color: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #eab308;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px; font-style: italic;">
            "{feedback_text[:300]}{'...' if len(feedback_text) > 300 else ''}"
        </p>
    </div>
    <p style="font-size: 14px; color: #94a3b8;">
        We appreciate you helping us improve Nakama Network.
    </p>
    """
    full_html = get_email_base_template(content, preheader="We got your feedback!")
    return email_service.send_email(user_email, "We Got Your Feedback! 📬", full_html)


def send_rank_promotion_email(user_email: str, display_name: str, new_rank: str) -> bool:
    """Send a congratulations email when a user ranks up."""
    content = f"""
    <h2 style="color: #eab308; margin-top: 0; font-size: 24px;">
        Rank Up! 🎉
    </h2>
    <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">
        Congratulations, {display_name}! You've achieved a new rank:
    </p>
    <div style="text-align: center; padding: 30px; margin: 25px 0; background: linear-gradient(135deg, rgba(234,179,8,0.15), rgba(202,138,4,0.05)); border-radius: 12px; border: 1px solid rgba(234,179,8,0.3);">
        <p style="margin: 0; font-size: 28px; font-weight: bold; color: #eab308;">
            {new_rank}
        </p>
    </div>
    <p style="font-size: 14px; color: #94a3b8; text-align: center;">
        Keep going — the path to Net God awaits.
    </p>
    """
    full_html = get_email_base_template(content, preheader=f"You reached {new_rank}!")
    return email_service.send_email(user_email, f"🎉 New Rank: {new_rank}!", full_html)


def send_welcome_email(email: str, display_name: str) -> bool:
    """Standalone wrapper so routers can import directly."""
    return email_service.send_welcome_email(email, display_name)
