# TODO: Make fullname and password required for student authentication

## Task Summary
Require both `fullname` AND `password` for student authentication. No login should be allowed without both fields.

## Changes Required

### 1. Update `components/student-login.tsx`
- [x] Add password validation - show error if password is empty
- [x] Remove the default "GMIS" password fallback
- [x] Update password label to show it's required (add asterisk)

### 2. Update `lib/auth-context.tsx`
- [x] Require password for all authentication (both new and existing students)
- [x] Don't auto-create students without a password
- [x] Properly validate password for existing students

## Implementation Steps

1. [x] Edit `components/student-login.tsx`
2. [x] Edit `lib/auth-context.tsx`
3. Test the changes

## Summary of Changes

### `components/student-login.tsx`:
- Added password validation to show error "Please enter your password" if empty
- Removed the default "GMIS" password fallback
- Added `*` indicator to password label
- Updated placeholder to "Enter your password"

### `lib/auth-context.tsx`:
- Added validation to reject login if either fullname or password is empty
- New students must provide a password to register
- Existing students without a password are rejected (since password is now required)
- Password validation now always checks the password for existing students

