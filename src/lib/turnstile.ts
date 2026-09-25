// Cloudflare Turnstile Server Verification Utility
// Verifies Turnstile tokens against https://challenges.cloudflare.com/turnstile/v0/siteverify

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Cloudflare Turnstile production secret key for mohsindesigns.com
const DEFAULT_PROD_SECRET_KEY = '0x4AAAAAAEJg7ZqMfKx2vSUv3G4ew9BiNhA';

export async function verifyTurnstileToken(
  token?: string,
  remoteip?: string
): Promise<{ success: boolean; error?: string; hostname?: string }> {
  // If token is missing, fail verification
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { success: false, error: 'Captcha verification is required. Please complete the security check.' };
  }

  const envSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  const secret = (envSecret && !envSecret.startsWith('1x0000')) ? envSecret : DEFAULT_PROD_SECRET_KEY;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token.trim());
    if (remoteip && remoteip !== 'unknown') {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, hostname: data.hostname };
    }

    const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'Verification failed';
    return {
      success: false,
      error: `Cloudflare Turnstile verification failed (${errorCodes}). Please refresh and try again.`
    };
  } catch (err: any) {
    console.error('Cloudflare Turnstile verification error:', err);
    return {
      success: false,
      error: 'Security verification service temporarily unreachable. Please try again.'
    };
  }
}
