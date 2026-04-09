// Expo Config Plugin for Android SMS Permissions
// This is used when building with EAS Build

module.exports = function withSMSPermissions(config) {
  if (!config.android) {
    config.android = {};
  }
  
  if (!config.android.permissions) {
    config.android.permissions = [];
  }

  // Add SMS permissions
  const smsPermissions = [
    'android.permission.RECEIVE_SMS',
    'android.permission.READ_SMS',
  ];

  smsPermissions.forEach(permission => {
    if (!config.android.permissions.includes(permission)) {
      config.android.permissions.push(permission);
    }
  });

  return config;
};
