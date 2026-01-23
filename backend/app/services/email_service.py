"""
Nakama Network - Email Service
Handles all email communications with premium HTML templates
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

from app.config import settings

SMTP_HOST = settings.smtp_host
SMTP_PORT = settings.smtp_port
SMTP_EMAIL = settings.smtp_email
SMTP_PASSWORD = settings.smtp_password
APP_NAME = "Nakama Network"
APP_URL = "https://nk-network-project.web.app"


def get_email_base_template(content: str, preheader: str = "") -> str:
    """Generate base HTML email template with content"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nakama Network</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Preheader text (hidden) -->
        <div style="display: none; max-height: 0px; overflow: hidden;">
            {preheader}
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
                                {content}
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
    """


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email via SMTP. Returns True on success, False on failure."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, skipping email send")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{APP_NAME} <{SMTP_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_welcome_email(email: str, display_name: str) -> bool:
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
            <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px;">
                <li style="padding: 8px 0;">⚔️ <strong>Battle Arena</strong> - Debate epic matchups</li>
                <li style="padding: 8px 0;">🧠 <strong>Millionaire Trivia</strong> - Test your knowledge</li>
                <li style="padding: 8px 0;">🔮 <strong>The Oracle</strong> - AI anime recommendations</li>
                <li style="padding: 8px 0;">🏰 <strong>Clans</strong> - Build your team</li>
                <li style="padding: 8px 0;">📈 <strong>Ranking System</strong> - Rise through 13 tiers</li>
            </ul>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="{APP_URL}" 
               style="background: linear-gradient(135deg, #eab308, #ca8a04);
                      color: #000;
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
    
    html = get_email_base_template(content, f"Welcome to Nakama Network, {display_name}!")
    return send_email(email, f"⚔️ Welcome to Nakama Network, {display_name}!", html)


def send_verification_email(email: str, display_name: str, verification_url: str) -> bool:
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
                      color: #000;
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
    
    html = get_email_base_template(content, "Verify your Nakama Network email")
    return send_email(email, "⚡ Verify Your Nakama Network Email", html)


def send_password_reset_email(email: str, display_name: str, reset_url: str) -> bool:
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
                      color: #000;
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
    
    html = get_email_base_template(content, "Password reset request for Nakama Network")
    return send_email(email, "🔒 Nakama Network Password Reset", html)


def send_feedback_received_email(email: str, display_name: str, preview: str) -> bool:
    """Confirm receipt of user feedback"""
    content = f"""
        <h2 style="color: #eab308; margin-top: 0; font-size: 24px;">
            Thanks for Your Feedback! 🙏
        </h2>
        
        <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">
            Hey {display_name}, we've received your message and truly appreciate you taking the time 
            to help us improve Nakama Network.
        </p>
        
        <!-- Feedback preview -->
        <div style="background-color: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #a855f7;">
            <p style="margin: 0 0 10px; color: #a855f7; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                Your Message:
            </p>
            <p style="margin: 0; color: #cbd5e1; font-size: 14px; font-style: italic;">
                "{preview}"
            </p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.7; color: #94a3b8;">
            Our team reviews every piece of feedback. If we need more details, 
            we'll reach out directly. Your voice shapes the future of Nakama Network!
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
            <p style="color: #eab308; font-size: 14px; margin: 0;">
                ⭐ Keep being awesome, {display_name}!
            </p>
        </div>
    """
    
    html = get_email_base_template(content, "Thanks for your feedback!")
    return send_email(email, "🙏 Thanks for Your Feedback!", html)


def send_rank_promotion_email(email: str, display_name: str, new_rank: str, rank_color: str) -> bool:
    """Celebrate user rank promotion with epic notification"""
    content = f"""
        <div style="text-align: center;">
            <h2 style="color: {rank_color}; margin-top: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">
                🎊 RANK UP! 🎊
            </h2>
            
            <p style="font-size: 18px; line-height: 1.7; color: #e2e8f0; margin-bottom: 30px;">
                {display_name}, your dedication has been recognized!
            </p>
            
            <!-- Rank badge -->
            <div style="background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3)); 
                        padding: 40px; 
                        border-radius: 16px; 
                        margin: 30px auto;
                        max-width: 300px;
                        border: 2px solid {rank_color};">
                <p style="margin: 0 0 10px; color: #94a3b8; font-size: 14px;">NEW RANK</p>
                <h1 style="margin: 0; color: {rank_color}; font-size: 32px; font-weight: 900;">
                    {new_rank}
                </h1>
            </div>
            
            <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 25px;">
                Keep pushing forward. The path to <strong style="color: #ff00ff;">Net God</strong> awaits!
            </p>
            
            <a href="{APP_URL}/profile" 
               style="background: linear-gradient(135deg, #eab308, #ca8a04);
                      color: #000;
                      padding: 14px 35px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 14px;
                      display: inline-block;">
                View Your Profile
            </a>
        </div>
    """
    
    html = get_email_base_template(content, f"Congratulations! You've reached {new_rank}!")
    return send_email(email, f"🎊 Rank Up: {new_rank}!", html)


def send_daily_prophecy_email(email: str, display_name: str, prophecy_text: str, anime_title: str) -> bool:
    """Send daily prophecy notification (for users who opt-in)"""
    content = f"""
        <div style="text-align: center;">
            <h2 style="color: #a855f7; margin-top: 0; font-size: 24px;">
                🔮 Daily Prophecy
            </h2>
            
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 25px;">
                The Oracle has spoken, {display_name}...
            </p>
            
            <!-- Prophecy card -->
            <div style="background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(139,92,246,0.05)); 
                        padding: 30px; 
                        border-radius: 16px; 
                        margin: 25px 0;
                        border: 1px solid rgba(168,85,247,0.3);">
                <p style="font-size: 18px; color: #e2e8f0; line-height: 1.8; margin: 0; font-style: italic;">
                    "{prophecy_text}"
                </p>
                <p style="margin: 20px 0 0; color: #a855f7; font-size: 14px;">
                    — Inspired by <strong>{anime_title}</strong>
                </p>
            </div>
            
            <a href="{APP_URL}/oracle" 
               style="color: #a855f7; text-decoration: none; font-size: 14px;">
                Get another prophecy →
            </a>
        </div>
    """
    
    html = get_email_base_template(content, "Your daily anime prophecy awaits!")
    return send_email(email, "🔮 Your Daily Prophecy", html)