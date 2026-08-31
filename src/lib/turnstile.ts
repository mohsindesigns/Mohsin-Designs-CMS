// Cloudflare Turnstile Server Verification Utility
// Verifies Turnstile tokens against https://challenges.cloudflare.com/turnstile/v0/siteverify

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Official Cloudflare Turnstile test secret key (always passes)
const DEFAULT_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function verifyTurnstileToken(
  token?: string,
  remoteip?: string
): Promise<{ success: boolean; error?: string; hostname?: string }> {
  // If token is missing, fail verification
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { success: false, error: 'Captcha verification is required. Please complete the security check.' };
  }

  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;

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
