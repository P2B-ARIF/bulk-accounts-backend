// Function to get a 2FA code from 2fa.live
async function get2FACode(secret) {
	try {
		const url = `https://2fa.live/tok/${secret}`;
		const response = await axios.get(url);
		return response.data.token; // Get the 2FA token
	} catch (error) {
		console.error("Error fetching 2FA code:", error);
		return null;
	}
}

module.exports = get2FACode;
