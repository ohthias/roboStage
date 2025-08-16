import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;

  const secretKey = process.env.TURNSTILE_SECRET_KEY; // coloque no .env
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey!,
      response: token,
    }),
  });

  const data = await verifyRes.json();
  res.status(200).json({ success: data.success });
}
