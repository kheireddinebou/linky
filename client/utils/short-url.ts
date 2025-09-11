const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const shortUrl = (shortCode: string) => `${SERVER_URL}/${shortCode}`;
