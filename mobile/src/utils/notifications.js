
import { Platform } from 'react-native';

export async function requestNotificationPermissionsAsync() {
    console.log("Notifications disabled.");
    return;
}

export function setupNotifications() {
    console.log("Notifications setup disabled.");
}

export async function scheduleNotification(title, body, data = {}) {
    console.log("Notification scheduled (mock):", title);
}
