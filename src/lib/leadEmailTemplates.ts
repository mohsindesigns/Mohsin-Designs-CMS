// HTML templates for the two lead e-mails, copied from the developer handoff (admin-new-lead.html and
// customer-confirmation.html). Table-based with inline styles on purpose: Gmail, Outlook and Apple Mail
// strip <style> blocks and ignore flex/grid. Placeholders are {{name}}; leadMail.ts fills them and
// HTML-escapes every user-supplied value before it gets here.

export const ADMIN_LEAD_TEMPLATE = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>New Lead — {{full_name}}</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
<style>
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .stack{display:block !important;width:100% !important;}
    .label-cell{padding-bottom:2px !important;}
    .btn a{display:block !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F6;-webkit-font-smoothing:antialiased;">
<!-- Preheader (shows in inbox preview, hidden in body) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  {{full_name}} requested {{service}} — reply within 1 hour for the best close rate.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF1F6;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Header bar -->
    <tr><td style="background-color:#0B1F4B;border-radius:10px 10px 0 0;padding:22px 36px;" class="px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="left" valign="middle">
          <img src="{{logo_white_url}}" alt="Mohsin Designs" width="150" style="display:block;border:0;outline:none;max-width:150px;height:auto;color:#ffffff;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;">
        </td>
        <td align="right" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#A9B6D3;letter-spacing:0.5px;">
          INTERNAL&nbsp;·&nbsp;LEAD&nbsp;ALERT
        </td>
      </tr></table>
    </td></tr>

    <!-- Body card -->
    <tr><td style="background-color:#FFFFFF;padding:36px 36px 8px 36px;" class="px">

      <!-- Status pill -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background-color:#E7F6EC;border-radius:20px;padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#1E7A3E;letter-spacing:0.8px;">
          &#9679;&nbsp;NEW LEAD
        </td>
      </tr></table>

      <h1 style="margin:18px 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;color:#0B1F4B;font-weight:bold;">
        {{full_name}} is interested in {{service}}
      </h1>
      <p style="margin:0 0 26px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#5B6478;">
        Submitted via <strong style="color:#2B3245;">{{form_source}}</strong> on {{submitted_at}}
      </p>

      <!-- Details table -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E8F0;border-radius:8px;">
        <tr><td colspan="2" style="background-color:#F6F8FB;border-bottom:1px solid #E3E8F0;border-radius:8px 8px 0 0;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#5B6478;letter-spacing:1px;">
          CONTACT DETAILS
        </td></tr>
        <tr>
          <td class="stack label-cell" width="34%" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Full name</td>
          <td class="stack" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;font-weight:bold;">{{full_name}}</td>
        </tr>
        <tr>
          <td class="stack label-cell" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Email</td>
          <td class="stack" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;"><a href="mailto:{{email}}" style="color:#1F5BD8;text-decoration:none;font-weight:bold;">{{email}}</a></td>
        </tr>
        <tr>
          <td class="stack label-cell" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Phone</td>
          <td class="stack" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;">{{phone_html}}</td>
        </tr>
        <tr>
          <td class="stack label-cell" style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Service</td>
          <td class="stack" style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;font-weight:bold;">{{service}}</td>
        </tr>
      </table>

      <!-- Message -->
      <p style="margin:26px 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#5B6478;letter-spacing:1px;">MESSAGE</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background-color:#F6F8FB;border-left:3px solid #0B1F4B;border-radius:0 6px 6px 0;padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#2B3245;">
          {{message}}
        </td>
      </tr></table>

      <!-- Actions -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>
        <td class="stack btn" style="padding:0 6px 10px 0;" width="50%">
          <a href="mailto:{{email}}?subject=Re:%20Your%20{{service_query}}%20inquiry" style="display:block;background-color:#0B1F4B;border-radius:6px;padding:14px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Reply to {{first_name}}</a>
        </td>
        <td class="stack btn" style="padding:0 0 10px 6px;" width="50%">
          <a href="{{crm_lead_url}}" style="display:block;background-color:#FFFFFF;border:1px solid #C9D1E0;border-radius:6px;padding:13px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#0B1F4B;text-decoration:none;">View in CRM</a>
        </td>
      </tr></table>

      <!-- Meta strip -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 28px 0;border-top:1px solid #EEF1F6;"><tr>
        <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8A92A6;">
          Lead ID: <strong style="color:#5B6478;">{{lead_id}}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;Page: <a href="{{page_url}}" style="color:#5B6478;">{{page_url}}</a>
        </td>
      </tr></table>

    </td></tr>

    <!-- Footer -->
    <tr><td style="background-color:#F6F8FB;border-radius:0 0 10px 10px;border-top:1px solid #E3E8F0;padding:20px 36px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8A92A6;" class="px">
      Automated internal notification from the Mohsin Designs website. Do not forward outside the team.
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

export const CUSTOMER_CONFIRMATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>We received your request — Mohsin Designs</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
<style>
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .stack{display:block !important;width:100% !important;}
    .step-num{padding-bottom:8px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F6;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  Thanks {{first_name}} — a specialist will contact you within 1 business day.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF1F6;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Logo -->
    <tr><td align="center" style="padding:0 0 22px 0;">
      <a href="https://mohsindesigns.com" style="text-decoration:none;">
        <img src="{{logo_url}}" alt="Mohsin Designs" width="170" style="display:block;border:0;outline:none;max-width:170px;height:auto;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#0B1F4B;">
      </a>
    </td></tr>

    <!-- Hero -->
    <tr><td align="center" style="background-color:#0B1F4B;border-radius:10px 10px 0 0;padding:44px 40px 40px 40px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="center" width="56" height="56" style="width:56px;height:56px;background-color:#1E7A3E;border-radius:28px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:56px;color:#FFFFFF;font-weight:bold;">&#10003;</td>
      </tr></table>
      <h1 style="margin:22px 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:34px;color:#FFFFFF;font-weight:bold;">
        Thanks, {{first_name}} — we've got your request
      </h1>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#C3CDE3;">
        Our {{service}} team will reach out within <strong style="color:#FFFFFF;">1 business day</strong>.
      </p>
    </td></tr>

    <!-- Body -->
    <tr><td style="background-color:#FFFFFF;padding:36px 40px 12px 40px;" class="px">

      <p style="margin:0 0 26px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#2B3245;">
        Hi {{first_name}},<br><br>
        Thank you for contacting Mohsin Designs. We've received your inquiry and our team is already reviewing it. Here's a copy of what you sent us for your records.
      </p>

      <!-- Summary -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E8F0;border-radius:8px;">
        <tr><td colspan="2" style="background-color:#F6F8FB;border-bottom:1px solid #E3E8F0;border-radius:8px 8px 0 0;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#5B6478;letter-spacing:1px;">
          YOUR REQUEST &nbsp;·&nbsp; REF {{lead_id}}
        </td></tr>
        <tr>
          <td class="stack" width="34%" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Service</td>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;font-weight:bold;">{{service}}</td>
        </tr>
        <tr>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Email</td>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;">{{email}}</td>
        </tr>
        <tr>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Phone</td>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;">{{phone}}</td>
        </tr>
        <tr>
          <td class="stack" valign="top" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Message</td>
          <td class="stack" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#1A2033;">{{message}}</td>
        </tr>
      </table>

      <!-- What happens next -->
      <h2 style="margin:34px 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:24px;color:#0B1F4B;font-weight:bold;">What happens next</h2>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="step-num" width="44" valign="top" style="padding-bottom:18px;">
            <div style="width:30px;height:30px;border-radius:15px;background-color:#E8EDF7;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:30px;text-align:center;color:#0B1F4B;font-weight:bold;">1</div>
          </td>
          <td valign="top" style="padding-bottom:18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#5B6478;">
            <strong style="color:#1A2033;">We review your request</strong><br>Our team looks at your business and goals before we call.
          </td>
        </tr>
        <tr>
          <td width="44" valign="top" style="padding-bottom:18px;">
            <div style="width:30px;height:30px;border-radius:15px;background-color:#E8EDF7;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:30px;text-align:center;color:#0B1F4B;font-weight:bold;">2</div>
          </td>
          <td valign="top" style="padding-bottom:18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#5B6478;">
            <strong style="color:#1A2033;">A specialist contacts you</strong><br>By phone or email within 1 business day.
          </td>
        </tr>
        <tr>
          <td width="44" valign="top" style="padding-bottom:6px;">
            <div style="width:30px;height:30px;border-radius:15px;background-color:#E8EDF7;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:30px;text-align:center;color:#0B1F4B;font-weight:bold;">3</div>
          </td>
          <td valign="top" style="padding-bottom:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#5B6478;">
            <strong style="color:#1A2033;">You get a clear plan</strong><br>A tailored proposal with scope, timeline and pricing.
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 8px 0;"><tr>
        <td align="center">
          <a href="{{booking_url}}" style="display:inline-block;background-color:#0B1F4B;border-radius:6px;padding:15px 34px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Book a call now</a>
        </td>
      </tr><tr>
        <td align="center" style="padding-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8A92A6;">
          Can't wait? Reply to this email or call <a href="tel:{{company_phone_tel}}" style="color:#1F5BD8;text-decoration:none;">{{company_phone}}</a>
        </td>
      </tr></table>

      <p style="margin:30px 0 30px 0;padding-top:24px;border-top:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#2B3245;">
        Talk soon,<br><strong style="color:#0B1F4B;">The Mohsin Designs Team</strong>
      </p>

    </td></tr>

    <!-- Footer -->
    <tr><td align="center" style="background-color:#F6F8FB;border-radius:0 0 10px 10px;border-top:1px solid #E3E8F0;padding:24px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8A92A6;" class="px">
      <a href="https://mohsindesigns.com" style="color:#0B1F4B;text-decoration:none;font-weight:bold;">mohsindesigns.com</a>
      &nbsp;·&nbsp; <a href="mailto:{{company_email}}" style="color:#5B6478;text-decoration:none;">{{company_email}}</a><br>
      {{company_address}}<br><br>
      You're receiving this because you submitted a form on our website. If this wasn't you, please ignore this email.
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
