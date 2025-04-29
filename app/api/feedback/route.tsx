// app/api/feedback/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { name, email, message } = await req.json();

    // Basic validation
    if (!name || !email || !message) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Send to yourself
        subject: 'New Feedback Submission',
        text: `You have received new feedback from ${name} (${email}):\n\n${message}`,
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Feedback email sent:', { name, email, message });

        return NextResponse.json({ message: 'Feedback received' }, { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        // Fix: safely handle the unknown error type
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to send feedback: ' + errorMessage }, { status: 500 });
    }
}