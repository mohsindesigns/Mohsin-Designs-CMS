import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';
import Content from '@/models/Content';
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await connectDB();
    const contentType = request.headers.get('content-type') || '';
    let name, email, phone, message, subject, type, attachmentUrl: string | undefined, extraData: any = {};
    let attachments: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      console.log('Received Form Keys:', Array.from(formData.keys()));
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string;
      message = formData.get('message') as string;
      subject = formData.get('subject') as string || formData.get('_subject') as string;
      type = formData.get('type') as string || 'Career Application';

      // Handle file attachment
      const file = formData.get('attachment') as File;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());

        // Save file to public/uploads
        const filename = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        attachmentUrl = `/uploads/${filename}`;
        console.log('File saved to:', filePath);
        console.log('Attachment URL set to:', attachmentUrl);

        attachments.push({
          filename: file.name,
          content: buffer.toString('base64'),
        });
      } else {
        console.log('No file attachment found in multipart data');
      }

      // Collect other fields
      formData.forEach((value, key) => {
        if (!['name', 'email', 'phone', 'message', 'subject', '_subject', 'type', 'attachment', '_captcha', '_template'].includes(key)) {
          extraData[key] = value;
        }
      });
    } else {
      const body = await request.json();
      ({ name, email, phone, message, subject, type, ...extraData } = body);
    }

    // Resilience: ensure required fields for DB save
    name = name || extraData.name || extraData.fullname || extraData.fullName || extraData.contact_name || 'Anonymous';
    email = email || extraData.email || extraData.user_email || extraData.contact_email || 'no-email@provided.com';
    message = message || extraData.message || extraData.comments || extraData.inquiry || 'No message content provided.';

    // Save to Database
    console.log('Saving submission with data:', { name, email, type, attachmentUrl });
    let submission;
    try {
      submission = await Submission.create({
        name,
        email,
        phone,
        subject,
        message,
        type: type || 'Contact Form',
        attachmentUrl,
        extraData
      });
      console.log('Submission saved successfully:', submission._id);
    } catch (dbError: any) {
      console.error('DATABASE SAVE ERROR:', dbError);
      // We still try to send the email even if DB save fails, but we want to know why it failed
    }

    // Fetch dynamic email from Content CMS
    let receiverEmail = 'banderson@eaglerevolution.com';
    try {
      const contentDoc = await Content.findOne({ key: "complete_data" }).lean() as any;
      if (contentDoc && contentDoc.data) {
        if (type === 'Quote Request' && contentDoc.data.quote?.email) {
          receiverEmail = contentDoc.data.quote.email;
        } else if (contentDoc.data.contactPage?.email) {
          receiverEmail = contentDoc.data.contactPage.email;
        } else if (contentDoc.data.quote?.email) {
          receiverEmail = contentDoc.data.quote.email;
        }
      }
    } catch (e) {
      console.error("Error fetching dynamic email", e);
    }

    if (receiverEmail) {
      receiverEmail = receiverEmail.replace(/\s+/g, '').toLowerCase();
    }

    if (!receiverEmail || !receiverEmail.includes('@')) {
      receiverEmail = 'banderson@eaglerevolution.com';
    }

    const to = receiverEmail;

    // Construct email HTML
    let html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">🦅 Eagle Revolution - New Submission</h2>
        <p><strong>Type:</strong> ${type || 'General Inquiry'}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
    `;

    // Add attachment link if present
    if (attachmentUrl) {
      const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}${attachmentUrl}`;
      html += `<p style="margin-top: 20px;"><strong>📎 Attachment:</strong> <a href="${fullUrl}">Download File</a></p>`;
    }

    // Add extra data if any
    if (Object.keys(extraData).length > 0) {
      html += `<div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        <p><strong>Additional Details:</strong></p>
        <ul style="list-style: none; padding: 0;">`;

      for (const [key, value] of Object.entries(extraData)) {
        if (value && typeof value !== 'object') {
          html += `<li style="margin-bottom: 5px;"><strong>${key.replace('_', ' ').toUpperCase()}:</strong> ${value}</li>`;
        }
      }

      html += `</ul></div>`;
    }

    html += `
        <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          ⏱️ Submitted: ${new Date().toLocaleString()}<br>
          🇺🇸 Veteran Owned & Operated
        </p>
      </div>
    `;

    // Prepare email content
    const emailContent = `
NEW SUBMISSION - EAGLE REVOLUTION
----------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Type: ${type || 'Contact Form'}
Subject: ${subject || 'No Subject'}

DETAILS:
${message || 'No message provided'}

${Object.entries(extraData).length > 0 ? `
ADDITIONAL INFO:
${Object.entries(extraData).map(([key, value]) => `${key}: ${value}`).join('\n')}
` : ''}

Submitted: ${new Date().toLocaleString()}
Source: Website
    `;

    // Send email using Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'Eagle Revolution <onboarding@resend.dev>',
      to: [receiverEmail],
      subject: subject || `New Lead: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #2430d2; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Submission</h1>
          </div>
          <div style="padding: 30px;">
            <p style="margin-top: 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Customer Info</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Name:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 500; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 500; font-size: 14px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 500; font-size: 14px;">${phone || 'Not provided'}</td>
              </tr>
            </table>

            <p style="margin-top: 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Message</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; color: #0f172a; font-style: italic; line-height: 1.6;">
              "${message || 'No message provided'}"
            </div>
          </div>
        </div>
      `,
      attachments: attachments.length > 0 ? attachments : []
    });

    if (resendError) {
      console.error('RESEND API ERROR:', {
        name: resendError.name,
        message: resendError.message,
        receiver: receiverEmail,
        isDefaultSender: !process.env.RESEND_DOMAIN_VERIFIED
      });
      return NextResponse.json({
        error: 'Email failed but DB saved',
        details: resendError.message,
        submissionId: submission?._id
      }, { status: 200 }); // Return 200 so UI doesn't show error if DB saved
    }

    return NextResponse.json({
      success: true,
      message: 'Submission saved and email sent',
      submissionId: submission?._id
    });

  } catch (error: any) {
    console.error('CRITICAL API ERROR IN /api/send:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json({
      error: 'Critical server error',
      details: error.message,
    }, { status: 500 });
  }
}
