export async function sendOtp(phone: string, code: string): Promise<boolean> {
    if (process.env.MOCK_SMS === "1") {
        console.log(`📱 [MOCK SMS] Sending OTP ${code} to ${phone}`);
        return true;
    }

    try {
        const apiKey = process.env.KAVENEGAR_API_KEY!;
        const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;

        const params = new URLSearchParams({
            receptor: phone,
            token: code,
            template: "fitbano-otp",
        });

        const res = await fetch(`${url}?${params.toString()}`, { method: "GET" });
        const data = await res.json();

        return data?.return?.status === 200;
    } catch (err) {
        console.error("SMS Error:", err);
        return false;
    }
}