import { Resend } from "resend"
import { config } from "./config"

// Initialize Resend client
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null

export interface SendOTPEmailResult {
  success: boolean
  error?: string
}

export async function sendOTPEmail(
  email: string,
  code: string
): Promise<SendOTPEmailResult> {
  if (!resend) {
    console.error("❌ Resend API key not configured")
    return {
      success: false,
      error: "Email service not configured. Please set RESEND_API_KEY.",
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: config.emailFromAddress || "SEE Practice <noreply@resend.dev>",
      to: email,
      subject: "🔑 Your Permanent Login Code / तपाईंको स्थायी लगइन कोड",
      html: generateOTPEmailHTML(code),
    })

    if (error) {
      console.error("❌ Failed to send email:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Permanent code email sent to ${email}, ID: ${data?.id}`)
    return { success: true }
  } catch (error) {
    console.error("❌ Email send error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function generateOTPEmailHTML(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Permanent Login Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f7f7;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">SEE Exam Practice</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">SEE परीक्षा अभ्यास</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello! Here is your <strong>permanent login code</strong>:
              </p>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                नमस्ते! यहाँ तपाईंको <strong>स्थायी लग इन कोड</strong> छ:
              </p>
              
              <!-- Code Box -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #92400e; letter-spacing: 8px;">${code}</span>
              </div>
              
              <!-- Important notice - SAVE THIS CODE -->
              <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 0 0 24px 0;">
                <p style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px; font-weight: 700; line-height: 1.6;">
                  ⚠️ IMPORTANT: Save this code! It's your permanent password.
                </p>
                <p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.6;">
                  ⚠️ महत्त्वपूर्ण: यो कोड सुरक्षित राख्नुहोस्! यो तपाईंको स्थायी पासवर्ड हो।
                </p>
              </div>
              
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; line-height: 1.6;">
                ✅ Use this code <strong>every time</strong> you log in.
              </p>
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                ✅ तपाईंले <strong>हरेक पटक</strong> लग इन गर्दा यो कोड प्रयोग गर्नुहोस्।
              </p>
              
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; line-height: 1.6;">
                📝 Write it down in a notebook or save it safely.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                📝 यसलाई कापीमा लेख्नुहोस् वा सुरक्षित रूपमा बचत गर्नुहोस्।
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
                If you didn't request this code, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center; line-height: 1.6;">
                यदि तपाईंले यो कोड अनुरोध गर्नुभएको छैन भने, तपाईं यो इमेल बेवास्ता गर्न सक्नुहुन्छ।
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
