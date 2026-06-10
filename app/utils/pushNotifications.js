"use client";

import { isNativeApp } from "./platform";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

export async function initPushNotifications({ userId, token } = {}) {
  if (!isNativeApp()) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");

  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") return;

  await PushNotifications.addListener("registration", async ({ value: fcmToken }) => {
    if (token) {
      try {
        await fetch(`${BASE_URL}/users/me/push-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token: fcmToken, platform: "ios" }),
        });
      } catch {}
    }
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration failed:", err);
  });

  await PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push received (foreground):", notification);
  });

  await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("Push tapped:", action);
    const url = action.notification?.data?.url;
    if (url && typeof window !== "undefined") {
      window.location.href = url;
    }
  });

  await PushNotifications.register();
}
