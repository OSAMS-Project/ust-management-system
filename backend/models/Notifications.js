const { executeTransaction } = require("../utils/queryExecutor");

const createNotificationsTable = async () => {
  const query = `
    CREATE TABLE  IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    notification_email VARCHAR(255) NOT NULL,
    notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
    `;
  return executeTransaction([{ query, params: [] }]);
};

const getNotificationSettings = async () => {
  try {
    const query = `
      SELECT notification_email, notifications_enabled
      FROM notification_settings
      LIMIT 1;
    `;
    const result = await executeTransaction([{ query, params: [] }]);
    return (
      result[0] || { notification_email: null, notifications_enabled: false }
    );
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    throw new Error("Failed to fetch notification settings.");
  }
};

const getNotificationEmail = async () => {
  try {
    const query = `
      SELECT notification_email 
      FROM notification_settings
      LIMIT 1;
    `;
    const result = await executeTransaction([{ query, params: [] }]);
    return result[0]?.notification_email || null;
  } catch (error) {
    console.error("Error fetching notification email:", error);
    throw new Error("Failed to fetch notification email.");
  }
};

const updateNotificationEmail = async (email) => {
  try {
    const query = `
      INSERT INTO notification_settings (id, notification_email)
      VALUES (1, $1)
      ON CONFLICT (id)
      DO UPDATE SET notification_email = $1, updated_at = CURRENT_TIMESTAMP
      RETURNING notification_email;
    `;
    const result = await executeTransaction([{ query, params: [email] }]);
    return result[0]?.notification_email;
  } catch (error) {
    console.error("Error updating notification email:", error);
    throw new Error("Failed to update notification email.");
  }
};

const updateNotificationsEnabled = async (enabled) => {
  try {
    const query = `
        UPDATE notification_settings
        SET notifications_enabled = $1, updated_at = CURRENT_TIMESTAMP
        RETURNING notifications_enabled;
      `;
    const result = await executeTransaction([{ query, params: [enabled] }]);
    return result[0]?.notifications_enabled;
  } catch (error) {
    console.error("Error updating notifications enabled state:", error);
    throw new Error("Failed to update notifications enabled state.");
  }
};

module.exports = {
  createNotificationsTable,
  getNotificationSettings,
  getNotificationEmail,
  updateNotificationEmail,
  updateNotificationsEnabled,
};
