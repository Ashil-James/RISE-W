// Verification Script for Profile & Password Update (using fetch)

async function test() {
    console.log("Starting verification...");
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    const newPassword = 'newpassword123';
    const baseUrl = 'http://localhost:5000/api/auth';

    try {
        // 1. Register
        console.log(`1. Registering user ${email}...`);
        let res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: email,
                password: password,
                phoneNumber: '1234567890'
            })
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        let token = data.token;
        console.log("   Registered. Token obtained.");

        // 2. Update Profile
        console.log("2. Updating profile location...");
        const newLocation = "Wayanad Updated";
        res = await fetch(`${baseUrl}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ location: newLocation })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Profile update failed');

        if (data.location === newLocation) {
            console.log("   SUCCESS: Profile location updated.");
        } else {
            console.error("   FAILURE: Location mismatch.", data);
        }

        // 3. Change Password
        console.log("3. Changing password...");
        res = await fetch(`${baseUrl}/update-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: password,
                newPassword: newPassword
            })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Password update failed');
        console.log("   Password change response:", data.message);

        // 4. Verify Old Password Login Fails
        console.log("4. Verifying old password login fails...");
        res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        if (res.status === 401) {
            console.log("   SUCCESS: Old password rejected.");
        } else {
            console.error("   FAILURE: Unexpected status:", res.status);
        }

        // 5. Verify New Password Login
        console.log("5. Verifying new password login...");
        res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: newPassword
            })
        });
        data = await res.json();
        if (res.ok) {
            console.log("   SUCCESS: Logged in with new password.");
            console.log("VERIFICATION COMPLETE");
        } else {
            console.error("   FAILURE: New password login failed:", data.message);
        }

    } catch (e) {
        console.error("CRITICAL FAILURE:", e.message);
    }
}

test();
