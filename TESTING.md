# Test Cases

## Register

| Feature  | Test Case               | Expected Result                     | Notes                                       |
| -------- | ----------------------- | ----------------------------------- | ------------------------------------------- |
| Register | Invalid email format    | Validation error returned           | Email regex should fail before repo call    |
| Register | Invalid password format | Validation error returned           | Depends on your password policy             |
| Register | Email already in use    | `EmailAlreadyInUseException` thrown | `existsByEmail` mocked to return true       |
| Register | Successful registration | User created in DB                  | Ensure password is hashed                   |
| Register | Successful registration | Tokens generated                    | `generateTokens` mocked                     |
| Register | Successful registration | Proper response returned            | Includes `id`, `email`, `createdAt`, tokens |

## Login

| Feature | Test Case                | Expected Result                           | Notes                          |
| ------- | ------------------------ | ----------------------------------------- | ------------------------------ |
| Login   | Email not found          | `InvalidCredentialsException` thrown      | `findByEmail` returns null     |
| Login   | Wrong password           | `InvalidCredentialsException` thrown      | `bcrypt.compare` returns false |
| Login   | Wrong password           | Failed attempts incremented               | Attempts +1                    |
| Login   | Too many failed attempts | Account locked (`AccountLockedException`) | After 5 attempts               |
| Login   | Locked account           | `AccountLockedException` thrown           | `lockoutUntil` > now           |
| Login   | Successful login         | Failed attempts reset                     | `resetFailedAttempts` called   |
| Login   | Successful login         | Tokens generated                          | `generateTokens` called        |
| Login   | New device/IP            | Security email sent                       | `sendEmail` called             |
| Login   | Known device/IP          | No email sent                             | `sendEmail` NOT called         |
| Login   | “Remember me” login      | Long-lived refresh token                  | Check token expiry params      |

## Logout

| Feature | Test Case              | Expected Result                | Notes                             |
| ------- | ---------------------- | ------------------------------ | --------------------------------- |
| Logout  | No sessionId or userId | `UserNotFoundException` thrown | Missing identifiers               |
| Logout  | Logout by sessionId    | Deletes only target session    | Use `deleteSession`               |
| Logout  | Logout by userId       | Deletes all sessions of user   | Use `deleteAllSessions`           |
| Logout  | Multiple logout calls  | No errors (idempotent)         | Should not break or double-delete |

## Refresh Token

| Feature | Test Case           | Expected Result                 | Notes                                     |
| ------- | ------------------- | ------------------------------- | ----------------------------------------- |
| Refresh | Invalid JWT format  | `InvalidRefreshTokenException`  | `jwt.verify` throws                       |
| Refresh | Session not found   | `InvalidRefreshTokenException`  | Token valid, but no session               |
| Refresh | Session expired     | `InvalidRefreshTokenException`  | `session.expiresAt < now`                 |
| Refresh | Valid refresh token | Returns new access token        | Only access token returned                |
| Refresh | Valid refresh token | Session `lastActive` updated    | Ensure timestamp changes                  |
| Refresh | Valid refresh token | JWT signed with correct payload | Validate `sub`, `iss`, `aud`, `sessionId` |
