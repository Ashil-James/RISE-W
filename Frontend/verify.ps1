$baseUrl = "http://localhost:5000/api/v1/auth"
$email = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$password = "password123"
$newPassword = "newpassword123"

# 1. Register
Write-Host "1. Registering user $email..."
$body = @{
    name = "Test User"
    email = $email
    password = $password
    phoneNumber = "1234567890"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $body -ContentType "application/json"
    $token = $res.token
    Write-Host "   Registered. Token obtained."
} catch {
    Write-Error "Registration failed: $($_.Exception.Message)"
    exit 1
}

# 2. Update Profile
Write-Host "2. Updating profile location..."
$newLocation = "Wayanad Updated"
$headers = @{ Authorization = "Bearer $token" }
$body = @{ location = $newLocation } | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/profile" -Method Put -Headers $headers -Body $body -ContentType "application/json"
    if ($res.location -eq $newLocation) {
        Write-Host "   SUCCESS: Profile location updated."
    } else {
        Write-Error "   FAILURE: Location mismatch."
    }
} catch {
    Write-Error "Profile update failed: $($_.Exception.Message)"
}

# 3. Change Password
Write-Host "3. Changing password..."
$body = @{
    currentPassword = $password
    newPassword = $newPassword
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/update-password" -Method Put -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "   Password change response: $($res.message)"
} catch {
    Write-Error "Password update failed: $($_.Exception.Message)"
}

# 4. Login with Old Password (Should Fail)
Write-Host "4. Verifying old password login fails..."
$body = @{ email = $email; password = $password } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $body -ContentType "application/json"
    Write-Error "   FAILURE: Old password login succeeded!"
} catch {
    # 401 is expected
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Unauthorized) {
        Write-Host "   SUCCESS: Old password rejected."
    } else {
        Write-Error "   FAILURE: Unexpected error: $($_.Exception.Message)"
    }
}

# 5. Login with New Password
Write-Host "5. Verifying new password login..."
$body = @{ email = $email; password = $newPassword } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "   SUCCESS: Logged in with new password."
} catch {
    Write-Error "   FAILURE: New password login failed: $($_.Exception.Message)"
}

Write-Host "VERIFICATION COMPLETE"
