if (process.env.ZARINPAL_SANDBOX === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
const merchantId = process.env.ZARINPAL_MERCHANT_ID!;

const BASE = isSandbox
    ? "https://sandbox.zarinpal.com"
    : "https://api.zarinpal.com";

const PAYMENT_URL = isSandbox
    ? "https://sandbox.zarinpal.com/pg/StartPay"
    : "https://www.zarinpal.com/pg/StartPay";

export async function requestPayment(
    amount: number,
    description: string,
    callbackUrl: string,
    phone: string
): Promise<{ authority: string; paymentUrl: string } | null> {
    try {
        const res = await fetch(`${BASE}/pg/v4/payment/request.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merchant_id: merchantId,
                amount,
                description,
                callback_url: callbackUrl,
                metadata: { mobile: phone },
            }),
        });

        const data = await res.json();

        if (data.data && data.data.authority) {
            return {
                authority: data.data.authority,
                paymentUrl: `${PAYMENT_URL}/${data.data.authority}`,
            };
        }

        console.error("Zarinpal request error:", data);
        return null;
    } catch (err) {
        console.error("Zarinpal request error:", err);
        return null;
    }
}

export async function verifyPayment(
    authority: string,
    amount: number
): Promise<{ refId: string; success: boolean } | null> {
    try {
        const res = await fetch(`${BASE}/pg/v4/payment/verify.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merchant_id: merchantId,
                amount,
                authority,
            }),
        });

        const data = await res.json();

        if (data.data && (data.data.code === 100 || data.data.code === 101)) {
            return {
                refId: String(data.data.ref_id),
                success: true,
            };
        }

        console.error("Zarinpal verify error:", data);
        return null;
    } catch (err) {
        console.error("Zarinpal verify error:", err);
        return null;
    }
}