# Scanovix Guardian

Scanovix AI

Tagline

Detect • Explain • Protect

Overview

Build a production-ready AI-powered cybersecurity mobile application named Scanovix AI. The application automatically detects scams and phishing attempts from URLs, websites, SMS messages, emails, QR codes, and images. The app should look like a premium cybersecurity product with a clean, colorful, futuristic UI.

Core Principle

Users should not select what they are scanning.

There must be one Smart Scan that automatically detects whether the input is:

 URL

 Website

 SMS

 Email

 QR Code

 Image Screenshot

The AI identifies the input type automatically and starts scanning.

Navigation

 Home

 Smart Scan

 History

 AI Assistant

 Profile

Home Screen

Display

 Greeting

 AI Security Status

 Smart Scan Button

 Recent Scans

 Daily Cyber Tip

 Threat Statistics

Smart Scan

One input field.

Placeholder:

Paste a link, message, email or scan a QR code...

Buttons

 Paste

 Camera

 QR Scanner

 Upload Image

The app automatically recognizes the content type.

Example

Paste

https://amazon-login-security.xyz

↓

Detected

Website URL

Automatically starts scanning.

Scan Result

Large animated Trust Score

Trust Score

18 / 100

Risk Level

🔴 High Risk

Status

❌ Fake

Confidence

98%

AI Explanation

Example

This website appears to be phishing because

• Newly registered domain

• Suspicious keywords detected

• Looks similar to Amazon

• Login page requests credentials

Risk Indicators

Show badges

🟥 Phishing

🟥 Scam

🟥 Fake Website

🟧 Suspicious Domain

🟨 Spam

🟩 Safe

AI Recommendation

Examples

❌ Don't open this website

❌ Don't enter passwords

❌ Don't share OTP

✅ Delete this message

✅ Report as phishing

Scan History

Store

 Content

 Type

 Date

 Trust Score

 Status

Filter

 Safe

 Suspicious

 Fake

Search history.

AI Assistant

Chat interface.

Examples

Is this website safe?

Explain phishing.

How do QR scams work?

What is a fake banking SMS?

How can I stay safe online?

Notifications

Show

 Scam Alerts

 Fake Website Alerts

 Daily Security Tips

 New Threat Updates

Profile

Display

 User Name

 Total Scans

 Fake Detected

 Safe Detected

 Security Score

 Settings

Dashboard Analytics

Cards

Total Scans

Fake Detected

Safe Content

Blocked Threats

Weekly Report

Average Trust Score

UI Theme

Style

 Modern

 Premium

 Glassmorphism

 Colorful

 Cybersecurity

 Smooth Animations

 Rounded Cards

 Gradient Backgrounds

 AI Glow Effects

Primary Colors

 Electric Blue (#2563EB)

 Purple (#7C3AED)

 Cyan (#06B6D4)

 White

 Soft Gray

Risk Colors

Green = Safe

Yellow = Suspicious

Orange = Warning

Red = Dangerous

AI Workflow

User pastes content

↓

AI identifies content type

↓

Security Analysis

↓

Trust Score (0–100)

↓

Risk Classification

↓

AI Explanation

↓

Recommended Action

↓

Save to History

Tech Stack

Frontend: Flutter

Backend: FastAPI

Database: Firebase Firestore

Authentication: Firebase Auth

AI Models:

 URL Phishing Detection

 SMS Scam Detection

 OCR for Images

 QR Analysis

 Gemini/OpenAI for Explanations

Goal

Create a real-world AI cybersecurity application that automatically detects scams from any digital content, assigns a Trust Score (0–100), classifies the result as Safe, Suspicious, or Fake, explains the reason in simple language, recommends the next action, and provides a polished, production-ready user experience suitable for deployment on Android and iOS.GET ACCESS FROM USER TO OPERATE AUTOMATICALLY IN OS AND SEND ALERT NOTIFICATION POP AS DANGEROUS SYMBOL AND ALSO DETECT,EXPLAIN,PROTECT ALL TYPES SCAM

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://scanovixcybernova.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fff2c73e-f122-4996-88c0-2c4e29b4a3c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
