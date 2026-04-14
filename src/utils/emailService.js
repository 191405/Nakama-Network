import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/* ──────────────────────────────────────────────────────
   Nakama Network — Premium Email System
   Uses Firebase Trigger Email Extension (mail collection)
   ────────────────────────────────────────────────────── */

const SITE_URL = 'https://nk-network-project.web.app';
const SITE_NAME = 'Nakama Network';
const YEAR = new Date().getFullYear();

/* ── Base email wrapper ── */
const emailLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Inter','Segoe UI',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px;">
      <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.5px;color:#ffffff;">
        Nakama <span style="color:#e5484d;">Network</span>
      </h1>
    </div>

    <!-- Main Card -->
    <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0 8px;">
      <p style="margin:0 0 8px;font-size:11px;color:#333;">
        &copy; ${YEAR} ${SITE_NAME}. All rights reserved.
      </p>
      <p style="margin:0;font-size:11px;color:#333;">
        <a href="${SITE_URL}" style="color:#555;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>
      </p>
    </div>

  </div>
</body>
</html>
`;

/* ── Queue email via Firestore Trigger Email Extension ── */
export const sendAutomatedEmail = async (to, subject, html, data = {}) => {
    if (!to || !db) {
        console.warn('Email service: Missing recipient or Firestore');
        return;
    }

    try {
        await addDoc(collection(db, 'mail'), {
            to: Array.isArray(to) ? to : [to],
            message: {
                subject,
                html,
            },
            ...data,
            createdAt: serverTimestamp(),
            status: 'pending',
        });
        console.log(`📧 Email queued → ${to}: ${subject}`);
    } catch (error) {
        console.error('Failed to queue email:', error);
        throw error;
    }
};

/* ════════════════════════════════════════════════════
   WELCOME EMAIL — sent on first signup
   ════════════════════════════════════════════════════ */
export const sendWelcomeEmail = async (user) => {
    if (!user?.email) return;

    const name = user.displayName || 'Newcomer';
    const subject = `Welcome to ${SITE_NAME}, ${name}`;

    const content = `
      <!-- Hero -->
      <div style="padding:40px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.04);">
        <h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;">
          Welcome aboard, ${name}.
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#888;">
          You've just joined the most dedicated anime information community on the internet. Explore thousands of titles, deep-dive into character wikis, and debate power rankings with fellow fans.
        </p>
      </div>

      <!-- Feature cards -->
      <div style="padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#fff;font-size:14px;">📚 Anime Database</strong>
              <p style="margin:6px 0 0;font-size:13px;color:#666;line-height:1.5;">Browse 28,000+ titles with ratings, synopses, characters, and seasonal schedules.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#fff;font-size:14px;">⚔️ Power Rankings</strong>
              <p style="margin:6px 0 0;font-size:13px;color:#666;line-height:1.5;">Our in-depth tiering system ranks fictional characters by destructive capacity and dimensional transcendence.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;">
              <strong style="color:#fff;font-size:14px;">🏛 Community</strong>
              <p style="margin:6px 0 0;font-size:13px;color:#666;line-height:1.5;">Join discussions, claim your character identity, and connect with fans worldwide.</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:8px 32px 32px;text-align:center;">
        <a href="${SITE_URL}/library" style="display:inline-block;padding:14px 40px;background:#e5484d;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
          Explore the Library
        </a>
      </div>
    `;

    await sendAutomatedEmail(user.email, subject, emailLayout(content), {
        type: 'welcome_email',
        userId: user.uid,
    });
};

/* ════════════════════════════════════════════════════
   UPDATE NOTIFICATION — inform users about site changes
   ════════════════════════════════════════════════════ */
export const sendUpdateNotification = async (subject, changes = []) => {
    if (!db) return 0;

    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        if (snapshot.empty) return 0;

        const changesHtml = changes.map(change => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#fff;font-size:14px;">${change.icon || '✦'} ${change.title}</strong>
              <p style="margin:6px 0 0;font-size:13px;color:#666;line-height:1.5;">${change.description}</p>
            </td>
          </tr>
        `).join('');

        const content = `
          <div style="padding:40px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.04);">
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">
              What's New
            </h2>
            <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
              We've been working hard to make your experience even better. Here's what's changed:
            </p>
          </div>

          <div style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              ${changesHtml}
            </table>
          </div>

          <div style="padding:8px 32px 32px;text-align:center;">
            <a href="${SITE_URL}" style="display:inline-block;padding:14px 40px;background:#e5484d;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;">
              Check It Out
            </a>
          </div>
        `;

        let count = 0;
        const promises = [];

        for (const userDoc of snapshot.docs) {
            const userData = userDoc.data();
            if (userData.email && userData.email.includes('@')) {
                promises.push(sendAutomatedEmail(
                    userData.email,
                    `${SITE_NAME} — ${subject}`,
                    emailLayout(content),
                    { type: 'update_notification', updateId: Date.now().toString() }
                ));
                count++;
            }
        }

        await Promise.all(promises);
        console.log(`📧 Update notification sent to ${count} users`);
        return count;
    } catch (error) {
        console.error('Update notification failed:', error);
        throw error;
    }
};

/* ════════════════════════════════════════════════════
   SEASONAL DIGEST — automated seasonal anime roundup
   ════════════════════════════════════════════════════ */
export const sendSeasonalDigest = async (seasonName, topAnime = []) => {
    if (!db) return 0;

    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        if (snapshot.empty) return 0;

        const animeRows = topAnime.slice(0, 6).map((anime, idx) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="width:32px;vertical-align:top;">
                    <span style="font-size:16px;font-weight:800;color:${idx < 3 ? '#e5484d' : '#555'};">${idx + 1}</span>
                  </td>
                  <td style="padding-left:12px;">
                    <strong style="color:#fff;font-size:13px;">${anime.title}</strong>
                    <p style="margin:4px 0 0;font-size:12px;color:#666;">
                      ${anime.score ? `★ ${anime.score}` : ''} ${anime.episodes ? `· ${anime.episodes} ep` : ''} ${anime.type || ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `).join('');

        const content = `
          <div style="padding:40px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.04);">
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">
              ${seasonName} Anime Guide
            </h2>
            <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
              Here are the top-rated anime from this season. Dive into our library for full details on each title.
            </p>
          </div>

          <div style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              ${animeRows}
            </table>
          </div>

          <div style="padding:8px 32px 32px;text-align:center;">
            <a href="${SITE_URL}/library" style="display:inline-block;padding:14px 40px;background:#e5484d;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;">
              Browse Full Season
            </a>
          </div>
        `;

        let count = 0;
        const promises = [];

        for (const userDoc of snapshot.docs) {
            const userData = userDoc.data();
            if (userData.email && userData.email.includes('@')) {
                promises.push(sendAutomatedEmail(
                    userData.email,
                    `${SITE_NAME} — ${seasonName} Top Anime`,
                    emailLayout(content),
                    { type: 'seasonal_digest', season: seasonName }
                ));
                count++;
            }
        }

        await Promise.all(promises);
        console.log(`📧 Seasonal digest sent to ${count} users`);
        return count;
    } catch (error) {
        console.error('Seasonal digest failed:', error);
        throw error;
    }
};

/* ════════════════════════════════════════════════════
   BROADCAST — legacy compat, uses new template
   ════════════════════════════════════════════════════ */
export const sendBroadcastEmail = async (subject, messageBody) => {
    return sendUpdateNotification(subject, [
        { icon: '📢', title: 'Announcement', description: messageBody }
    ]);
};
