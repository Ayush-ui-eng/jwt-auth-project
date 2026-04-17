exports.logout = (req, res) => {

    // 🔥 ADD THIS LINE (VERY IMPORTANT)
    console.log("👉 BODY RECEIVED:", req.body);

    const authHeader = req.headers["authorization"];
    const { refreshToken } = req.body;

    if (!authHeader) {
        console.log("❌ No auth header");
        return res.sendStatus(400);
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
        console.log("❌ No access token");
        return res.sendStatus(400);
    }

    // 🚫 Blacklist access token
    blacklist.add(accessToken);

    if (!refreshToken) {
        console.log("⚠️ No refresh token provided in body");
    } else {
        console.log("👉 Incoming refresh token:", refreshToken);

        if (refreshTokens.has(refreshToken)) {
            refreshTokens.delete(refreshToken);
            console.log("🗑️ Refresh token REMOVED successfully");
        } else {
            console.log("⚠️ Refresh token NOT FOUND in storage");
        }
    }

    console.log("🚫 Access token blacklisted:", accessToken);

    res.json({ message: "Logged out completely" });
};