/**
 * Humanizes technical, Firestore, or Firebase auth errors into friendly user action items.
 */
export function getFriendlyErrorMessage(err: any): string {
  if (!err) return 'Something went wrong on our end. Please try again.';
  
  let message = typeof err === 'string' ? err : (err?.message || String(err));
  
  // If it's a serialized FirestoreErrorInfo JSON
  if (message.includes('{"') && message.includes('error"') && message.includes('operationType"')) {
    try {
      const parsed = JSON.parse(message);
      if (parsed && parsed.error) {
        message = parsed.error;
      }
    } catch {
      // ignore JSON parse error, fall back to string matches
    }
  }

  const msgLower = message.toLowerCase();

  // Offline check
  if (msgLower.includes('offline')) {
    return 'You are currently offline';
  }

  // Network / Connection Issues
  if (
    msgLower.includes('network') || 
    msgLower.includes('connection') || 
    msgLower.includes('failed to fetch') || 
    msgLower.includes('timeout') ||
    msgLower.includes('timed out') ||
    msgLower.includes('unavailable')
  ) {
    return 'Check your internet connection';
  }

  // Firebase/Firestore Permission/Security Rules Errors
  if (msgLower.includes('permission-denied') || msgLower.includes('insufficient permissions')) {
    return 'Problem from our end. We are working on it. Please try again later.';
  }

  // Auth specific errors
  if (msgLower.includes('auth/invalid-credential') || msgLower.includes('wrong-password') || msgLower.includes('check password') || msgLower.includes('invalid-password')) {
    return 'Incorrect password or email. Please verify and try again.';
  }
  if (msgLower.includes('auth/user-not-found') || msgLower.includes('email not registered yet') || msgLower.includes('user-not-found')) {
    return 'This email is not registered yet. Please sign up or verify the address.';
  }
  if (msgLower.includes('auth/email-already-in-use') || msgLower.includes('already linked') || msgLower.includes('already-in-use') || msgLower.includes('email-already-in-use')) {
    return 'This account already exist';
  }
  if (msgLower.includes('auth/weak-password')) {
    return 'Your password is too weak. Please use at least 6 characters.';
  }
  if (msgLower.includes('auth/operation-not-allowed') || msgLower.includes('operation-not-allowed')) {
    return 'Problem from our end. Email authentication is currently offline. Please try Sandbox mode.';
  }
  if (msgLower.includes('auth/too-many-requests') || msgLower.includes('too-many-requests')) {
    return 'Too many attempts. Please check your connection and wait a moment before trying again.';
  }
  if (msgLower.includes('requires-recent-login') || msgLower.includes('recent-login')) {
    return 'For security, please log out and sign back in before modifying your account details.';
  }

  // General server/unknown errors
  if (msgLower.includes('internal') || msgLower.includes('server') || msgLower.includes('firestore') || msgLower.includes('firebase')) {
    return 'Problem from our end. We encountered a server hiccup. Please try again in a few moments.';
  }

  return message || 'Something went wrong. Please check your connection and try again.';
}
