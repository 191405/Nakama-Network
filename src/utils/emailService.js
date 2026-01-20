import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const sendAutomatedEmail = async (to, subject, html, data = {}) => {
    if (!to) {
        console.error('Email service: Recipient is required');
        return;
    }

    try {
        await addDoc(collection(db, 'mail'), {
            to: Array.isArray(to) ? to : [to],
            message: {
                subject: subject,
                html: html
            },
            ...data,
            createdAt: serverTimestamp(),
            status: 'pending' 
        });
        console.log(`Email queued for ${to}: ${subject}`);
    } catch (error) {
        console.error('Failed to queue email:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (user) => {
    if (!user || !user.email) return;

    const subject = "Welcome to Nakama Network! 🌟";

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050505; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f14; border: 1px solid rgba(202, 138, 4, 0.2); border-radius: 16px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ca8a04 0%, #a16207 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Nakama Network</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.8);">The Ultimate Anime Community</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
                <h2 style="color: #eab308; margin-top: 0;">Welcome, ${user.displayName || 'Warrior'}!</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                    We are thrilled to have you join our ranks. The Nakama Network is more than just a site—it's a gathering of the strongest anime fans in the world.
                </p>
                
                <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #eab308;">
                    <p style="margin: 0; font-weight: bold; color: #fff;">Here's what you can do now:</p>
                    <ul style="margin-top: 10px; color: #cbd5e1;">
                        <li>🔥 <strong>Battle Arena:</strong> Debate and vote on epic matchups.</li>
                        <li>📺 <strong>Anime Library:</strong> Watch uploaded anime in HD quality.</li>
                        <li>💬 <strong>Global Media:</strong> Share memes and discuss live.</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="https://nk-network-project.web.app/" style="background-color: #eab308; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; text-transform: uppercase;">
                        Enter the Network
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #050505; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05);">
                <p>&copy; ${new Date().getFullYear()} Nakama Network. All rights reserved.</p>
                <p>You received this email because you signed up for the Nakama Network.</p>
            </div>
        </div>
    </div>
    `;

    await sendAutomatedEmail(user.email, subject, html, {
        type: 'welcome_email',
        userId: user.uid
    });
};

export const sendBroadcastEmail = async (subject, messageBody) => {
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        if (snapshot.empty) return 0;

        let count = 0;
        const batchPromises = [];

        const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050505; color: #e2e8f0; padding: 40px; border-radius: 16px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f14; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
                <div style="background-color: #1a1a20; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                    <h2 style="color: #eab308; margin: 0;">Nakama Network Alert</h2>
                </div>
                <div style="padding: 30px;">
                    ${messageBody}
                </div>
                <div style="background-color: #050505; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
                    <p>You are receiving this global announcement as a member of Nakama Network.</p>
                </div>
            </div>
        </div>
        `;

        for (const doc of snapshot.docs) {
            const userData = doc.data();
            if (userData.email && userData.email.includes('@')) {

                batchPromises.push(sendAutomatedEmail(userData.email, subject, html, {
                    type: 'broadcast',
                    broadcastId: Date.now().toString()
                }));
                count++;
            }
        }

        await Promise.all(batchPromises);
        return count;
    } catch (error) {
        console.error('Broadcast failed:', error);
        throw error;
    }
};
