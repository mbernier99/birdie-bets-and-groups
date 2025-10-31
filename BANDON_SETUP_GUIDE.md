# 🏌️ Bandon Dunes Setup Guide

## ✅ Pre-Trip Checklist (Complete Before Leaving)

### 1. CRITICAL: Disable Email Confirmation in Supabase
**DO THIS TODAY - Required for smooth onsite registration**

1. Go to: https://supabase.com/dashboard/project/oxwauckpccujkwfagogf/auth/providers
2. Scroll to "Email Auth" section
3. **UNCHECK** "Confirm email" option
4. Save changes
5. **TEST:** Create a new test account and verify you can sign in immediately without email confirmation

### 2. Test Authentication & Session Persistence
- [ ] Create 3 test accounts
- [ ] Verify all can sign in without email confirmation
- [ ] Test Google OAuth signup
- [ ] Close browser and reopen after 10 minutes - verify still signed in
- [ ] Test on mobile phone - verify session persists

### 3. Run Connection Test
- [ ] Open any tournament lobby as the organizer
- [ ] Run the "Connection Test" button that appears
- [ ] Verify all 3 checks pass (Auth, Database, GPS)
- [ ] Screenshot results for reference

### 4. Test Multi-Group Betting
- [ ] Create tournament with 8 test players
- [ ] Divide into 2 groups of 4 in your notes
- [ ] Create cross-group press bet (Group A player → Group B player)
- [ ] Verify opponent can see and accept the bet
- [ ] Verify Press Ledger shows bet correctly

### 5. Test Manual Bet Resolution
- [ ] Create a "closest-to-pin" bet between 2 players
- [ ] Enter scores for that hole
- [ ] Verify "Needs Resolution" badge appears in Press Ledger
- [ ] Click "Resolve" button
- [ ] Select winner or tie
- [ ] Verify bet status updates to "completed" or "pushed"

---

## 📱 Day-Of Setup at Bandon Dunes

### Pre-Round (45 minutes before tee time)

#### Tournament Creator Steps:
1. **Create Tournament (Day Before is Better)**
   - Navigate to: https://your-app-url.com/tournaments
   - Click "Create Tournament"
   - Name: "Bandon Dunes - [Course Name] - Day 1"
   - Course: Select actual Bandon course
   - Format: Stroke Play
   - Side Games: Nassau + Skins
   - Enable "Allow Presses"
   - Max Players: 8
   - Entry Fee: (if applicable)

2. **Add All Players**
   - Add all 8 players with their:
     - Name
     - Email (must match account email)
     - Handicap (verified GHIN if available)
   - Save tournament

3. **Share Invite Link**
   - Click "Invite Players" button
   - Copy link and text to all players
   - OR: Have them scan QR code (if implemented)

4. **Run Connection Test**
   - Open tournament lobby
   - Click "Run Connection Test" button
   - Verify all checks pass:
     - ✅ Authentication: Valid session
     - ✅ Database: Connected
     - ✅ GPS: Location permissions granted

#### Each Player Steps (30 mins before tee time):
1. **Open Invite Link**
   - Tap the link received via text/email
   - Opens in phone browser

2. **Sign In or Create Account**
   - If existing user: Sign in with email/password or Google
   - If new user: Create account (NO email confirmation needed!)
     - First name, Last name, Email, Password
     - Click "Sign Up"
     - Immediately signed in

3. **Accept Tournament Invitation**
   - Click "Accept" on the invitation
   - Verify handicap is correct
   - Status changes to "Confirmed"

4. **Verify Profile Settings**
   - Tap profile icon (bottom nav)
   - Check handicap is correct
   - Upload avatar (optional)
   - Verify notifications are enabled:
     - Press notifications: ON
     - Score updates: ON
     - Haptic feedback: ON

5. **Test Score Entry (On 1st Tee)**
   - Open tournament
   - Navigate to scorecard
   - Enter dummy score for Hole 1
   - Delete the score
   - Verify it worked

---

## 🎮 During Round Procedures

### Score Entry (After Each Hole)
**Designate 1-2 Scorekeepers per Group**

1. After completing hole, scorekeeper opens app
2. Navigate to tournament → Scorecard
3. Tap hole number
4. Enter scores for all 4 players in group
5. Save
6. Verify leaderboard updates

**Takes ~30 seconds per hole**

### Press Betting - Automated Bets

**Types: This Hole, Remaining Holes, Total Strokes**

#### Creating a Bet:
1. Open tournament
2. Tap floating "BET" button (bottom right)
3. Select bet type
4. Select opponent (can be from other group!)
5. Set wager amount (e.g., $5, $10, $20)
6. Tap "Send Press"

#### Accepting a Bet:
1. Receive notification: "[Player] wants to press you!"
2. Tap notification or open tournament
3. View bet details
4. Tap "Accept" or "Decline"

#### Resolution:
- **Automatic!** No action needed
- After hole(s) completed and scores entered
- Bet resolves immediately
- Check Press Ledger for result
- Green = won, Red = lost, Gray = pushed (tie)

### Press Betting - Manual Bets (Location-Based)

**Types: Closest-to-Pin, Longest-Drive, First-to-Green**

#### Creating the Bet (Before Hole):
1. Tap "BET" button
2. Select bet type (e.g., "Closest-to-Pin")
3. Select opponent
4. Set wager (e.g., $20)
5. Send press

#### During the Hole:
1. After shots, TAKE PHOTO of ball position
   - Closest-to-pin: Photo showing distance to pin
   - Longest-drive: Photo showing drive position with marker
2. Both players take their own photos

#### After the Hole:
1. **Tournament Admin opens Press Ledger**
2. Find bet with "Needs Resolution" badge
3. Tap "Resolve" button
4. Review photos (if uploaded)
5. Select winner or "Tie"
6. Confirm

**Settlement processes immediately**

### Leaderboard Checks
- Check every 3 holes
- Both groups should verify:
  - All scores entered correctly
  - Net scores calculating properly
  - Nassau points updating
  - Skins showing correctly

### Battery Management
**Golf rounds with GPS + screen use drain batteries quickly**

- Bring portable chargers for all phones
- Use low-power mode when not actively using app
- Close other apps
- Dim screen brightness
- Designate 1-2 scorekeepers to minimize battery use

---

## 🚨 Troubleshooting On-Course

### "Can't see player from other group in bet list"
**Cause:** Player not confirmed in tournament
**Fix:**
1. Open tournament lobby
2. Check "Participants" section
3. Verify player status is "Confirmed" (green checkmark)
4. If "Pending": Have player re-open invite link and accept

### "Bet not auto-resolving"
**Cause:** Scores not entered for one or both players
**Fix:**
1. Go to Scorecard
2. Verify scores entered for the hole in question
3. Check for both players involved in bet
4. If scores present, pull down to refresh

### "Session expired / Logged out"
**Cause:** Network interruption during session refresh
**Fix:**
1. Log back in immediately (credentials cached)
2. Verify all scores still present
3. Continue as normal

**Prevention:**
- Keep app open when entering scores
- Don't let phone lock during active use

### "Manual bet stuck in pending"
**Fix:**
1. Tournament creator opens Press Ledger
2. Find bet with "Needs Resolution"
3. Tap "Resolve"
4. Select winner based on observation/photos
5. Confirm

### "Slow connection / Not updating"
**What You'll See:**
- Yellow banner: "Slow connection - Some features may be delayed"
- Scores may take longer to sync

**What to Do:**
- Continue entering scores normally
- They'll sync when connection improves
- Check leaderboard after each hole to verify sync

### "No connection at all"
**What You'll See:**
- Red banner: "No internet connection - Scores will sync when reconnected"

**What to Do:**
- Enter scores as normal - they're stored locally
- When connection returns, scores auto-sync
- Verify sync by checking leaderboard

### "GPS not working for location bets"
**Fix iOS:**
1. Settings → BetLoopr → Location
2. Change to "While Using App"
3. Restart app

**Fix Android:**
1. Settings → Apps → BetLoopr → Permissions
2. Location → Allow
3. Restart app

---

## 📊 Post-Round Settlement

### 1. Verify All Data Complete
- [ ] All 18 holes scored for all players
- [ ] All automated bets resolved
- [ ] All manual bets resolved (no "pending" or "active")
- [ ] Leaderboard shows final standings

### 2. Review Press Ledger
Each player should:
1. Open their Press Ledger
2. Review all bets:
   - Green = Money won
   - Red = Money lost
   - Gray = Pushed (no exchange)
3. Check net winnings at top

### 3. Settlement
**Calculate Individual Settlements:**
- Press Ledger shows net for press bets
- Nassau/Skins calculated separately
- Total up all categories
- Settle via Venmo/cash

**Example:**
```
Player A:
Press Bets: +$35
Nassau: -$20
Skins: +$10
Total: +$25 (collect $25)

Player B:
Press Bets: -$15
Nassau: +$30
Skins: $0
Total: +$15 (collect $15)
```

### 4. Record Keeping
- Screenshot final leaderboard
- Screenshot each player's Press Ledger
- Save for league standings/records

---

## 🎯 Success Metrics

By the end of your Bandon trip, you should achieve:
- ✅ All 8 players signed up and active
- ✅ Zero authentication issues
- ✅ All rounds completed with full scoring
- ✅ 20+ press bets created and resolved
- ✅ Manual bets (closest-to-pin) resolved correctly
- ✅ Cross-group betting working smoothly
- ✅ No lost scores due to network issues
- ✅ Fast settlements with accurate calculations

---

## 📞 Emergency Support

If critical issues arise:
1. Try "Connection Test" first
2. Have all players pull-to-refresh
3. Worst case: Manual scorekeeping on paper, enter later
4. Document issues for post-trip fixes

---

## 🏆 Tips for Success

1. **Assign Roles:**
   - Tournament Admin: 1 person (creates tournament, resolves manual bets)
   - Scorekeepers: 2 per group (alternates)
   - Press Initiators: Anyone!

2. **Best Practices:**
   - Create tournament day before (not day-of)
   - All players sign up night before
   - Run connection test on 1st tee
   - Enter scores immediately after each hole
   - Check leaderboard every 3 holes
   - Keep phones charged

3. **Communication:**
   - Share invite link via group text
   - Confirm all players "Confirmed" before teeing off
   - Designate one person for manual bet resolution
   - Settle up immediately after round

4. **Have Fun:**
   - The app should enhance the experience
   - Don't let technical issues slow down play
   - If something isn't working, move on and fix later
   - Golf comes first, app second

---

## 🚀 Ready to Go Checklist

**Complete Before Trip:**
- [ ] Email confirmation disabled in Supabase
- [ ] 3 test accounts created successfully
- [ ] Connection test passed on desktop
- [ ] Connection test passed on mobile
- [ ] Manual bet resolution tested
- [ ] Cross-group betting tested
- [ ] All 8 players have app access
- [ ] Tournament creator knows their role
- [ ] Scorekeepers designated

**You're ready for Bandon! 🏌️**
