# FormSubmit.co Setup Guide for TLKA Memorial Website

## Overview
The contact form has been integrated with FormSubmit.co to automatically send email notifications when visitors submit messages through the website.

## Setup Steps

### 1. Replace Email Address
In `index.html` (line 106), replace `your-email@example.com` with your actual email address:

```html
<form class="contact-form" action="https://formsubmit.co/your-email@example.com" method="POST">
```

**Example:**
```html
<form class="contact-form" action="https://formsubmit.co/john@example.com" method="POST">
```

### 2. Update Thank You Page URL
In `index.html` (line 110), replace the `_next` URL with your actual domain:

```html
<input type="hidden" name="_next" value="https://yourdomain.com/thank-you.html">
```

**Example:**
```html
<input type="hidden" name="_next" value="https://tlka-memorial.com/thank-you.html">
```

### 3. First-Time Activation
1. **Deploy your website** with the updated email address
2. **Submit a test form** - this will trigger FormSubmit.co's email verification
3. **Check your email** for a verification message from FormSubmit.co
4. **Click the verification link** to activate the form

### 4. Configuration Features Included

#### Email Subject Line
```html
<input type="hidden" name="_subject" value="New Contact Form Submission - TLKA Memorial Website">
```

#### Spam Protection
```html
<input type="hidden" name="_captcha" value="false">
```
- Set to `false` for now (can be enabled later if needed)

#### Email Template
```html
<input type="hidden" name="_template" value="table">
```
- Formats the email in a clean table layout

#### Redirect After Submission
```html
<input type="hidden" name="_next" value="https://yourdomain.com/thank-you.html">
```
- Users see a thank you page after submitting

## Email Format
You'll receive emails with:
- **Subject:** "New Contact Form Submission - TLKA Memorial Website"
- **From:** FormSubmit.co (on behalf of the sender)
- **Content:** Name, Email, and Message in a table format
- **Reply-To:** The sender's email address (so you can reply directly)

## Advanced Options (Optional)

### Enable Captcha Protection
If you start receiving spam, change:
```html
<input type="hidden" name="_captcha" value="true">
```

### Custom Email Template
You can customize the email template by adding:
```html
<input type="hidden" name="_template" value="box">
```
Options: `table`, `box`, `basic`

### CC/BCC Additional Recipients
```html
<input type="hidden" name="_cc" value="admin@example.com">
<input type="hidden" name="_bcc" value="backup@example.com">
```

### Auto-Response to Sender
```html
<input type="hidden" name="_autoresponse" value="Thank you for contacting us about Kabir's memorial. We will get back to you soon.">
```

## Files Created/Modified

### Modified Files:
- `index.html` - Updated contact form with FormSubmit.co integration

### New Files:
- `thank-you.html` - Thank you page shown after form submission
- `FORMSUBMIT_SETUP.md` - This setup guide

## Testing
1. Fill out the contact form on your website
2. Submit the form
3. Check your email for the notification
4. Verify the thank you page displays correctly

## Troubleshooting

### Not Receiving Emails?
1. Check spam/junk folder
2. Verify email address in form action is correct
3. Ensure you've completed the email verification step
4. Try submitting another test form

### Form Not Redirecting?
1. Check the `_next` URL is correct and accessible
2. Ensure `thank-you.html` is uploaded to your server
3. Verify the domain matches your website's domain

### Need Help?
- FormSubmit.co Documentation: https://formsubmit.co/
- FormSubmit.co is free and doesn't require registration
- All configuration is done through hidden form fields

## Security Notes
- FormSubmit.co handles spam protection
- No sensitive data is stored on their servers
- Emails are sent immediately and not retained
- HTTPS is required for production use