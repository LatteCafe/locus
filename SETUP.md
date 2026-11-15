# Locus — Phase 0 setup

Everything here is a one-time job. Work top to bottom. Anything in a grey box
is meant to be copied and pasted into your Terminal.

---

## 1. Create the Supabase project (done)

1. Go to <https://supabase.com> and sign up (free tier is fine).
2. Click **New project**.
   - **Name**: `locus`
   - **Database password**: click Generate, then **save it in your password
     manager**. You will need it in step 3 and cannot look it up later.
   - **Region**: `East US (North Virginia)` — closest to Toronto of the free
     options.
3. Wait for it to finish setting up (a minute or two).

## 2. Put your keys in the app (done)

In the Supabase dashboard for your new project:

1. **Project Settings** (gear icon) → **Data API**. Copy the **Project URL**.
2. **Project Settings** → **API Keys**. Copy the key labelled **anon** or
   **publishable**.

Now open the file `.env` in the `locus` folder (it is already there, with
blank values) and paste them in, so it looks like this:

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> The anon key is safe to ship inside the app — it can only do what the
> database's security rules allow. **Never** copy the `service_role` key into
> this file; that one bypasses every rule.

## 3. Create the database tables

This pushes all the tables, security rules and calculations to your project.

Log in to the Supabase CLI (opens your browser):

```bash
supabase login
```

Link this folder to your project. Replace `YOUR_PROJECT_REF` with the
**Reference ID** from **Project Settings → General**:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

It will ask for the database password from step 1.

Then push the schema:

```bash
npm run db:push
```

It will list the 11 migration files and ask you to confirm. Say yes. You
should see each one applied with no errors.

**To check it worked:** in the Supabase dashboard go to **Table Editor**. You
should see `profiles`, `places`, `sessions`, `place_ratings`, `friendships`,
`invitations`, `cosmetics` and a few more.

## 4. Turn on email sign-in codes

By default Supabase emails a _magic link_. Locus asks for a 6-digit code
instead, so:

1. **Authentication** → **Emails** → **Templates** → **Magic Link**.
2. Replace the whole template body with:

   ```html
   <h2>Your Locus code</h2>
   <p>Enter this code in the app:</p>
   <p style="font-size:28px;letter-spacing:6px;"><strong>{{ .Token }}</strong></p>
   <p>It expires in an hour. If you did not ask for it, ignore this email.</p>
   ```

   The important part is `{{ .Token }}` — that is what makes it send a code
   rather than a link.

3. Save.

> **Heads up on the free tier:** Supabase's built-in email sender is limited
> to a few messages an hour and is only meant for testing. Before you give
> the app to real testers you will need to connect a proper email service
> (Resend has a free tier) under **Project Settings → Authentication → SMTP
> Settings**. I will walk you through it in Phase 9.

## 5. Run it on the Android emulator

We are testing on an Android emulator on your friend's computer. Locus is on
Expo SDK 58, which the phone version of Expo Go does not reliably run yet, so
an emulator is the dependable way to see the app.

### Getting the project onto that machine

That computer needs three things:

1. **Node 22 or newer.** Check with `node -v`.
2. **The project.** Clone it from git, then run `npm install` inside it.
3. **Your `.env` file.** This is the one thing git does not carry, on purpose —
   it holds your keys. Copy it across by hand, or recreate it from
   `.env.example` with the two Supabase values from step 2.

Then, with Android Studio's emulator already running on that machine:

```bash
npx expo start --android
```

Expo installs Expo Go onto the emulator by itself and opens Locus in it. If
the emulator is not running yet, start it from Android Studio's Device
Manager first.

> If you would rather test on this Mac after all, say so and I will set up a
> local emulator — the Android command-line tools and JDK 17 are already
> installed here, and only Google's SDK licence and a ~2GB system image are
> left to do.

### Then walk through it

- Enter your email, tap **Email me a code**.
- Check your inbox, type the 6 digits.
- Walk through the five onboarding screens.
- You should land on the Home tab with your name on it.

### What you should be able to test

| Thing to try                                    | What should happen                                         |
| ----------------------------------------------- | ---------------------------------------------------------- |
| Sign in with your email                         | Code arrives, app lets you in                              |
| Pick a username someone has                     | "That one is taken" under the field                        |
| Type a bad username (`ab`, `has space`)         | Explains the rules                                         |
| Add course codes                                | They become tappable chips you can remove                  |
| Finish onboarding                               | Lands on Home, greets you by first name                    |
| Profile tab                                     | Shows your email, school, courses, referral code           |
| Settings → toggle "Share sessions with friends" | Flips and stays flipped when you come back                 |
| Settings → Privacy Policy / Terms               | Readable, marked as placeholder text                       |
| Settings → Delete my account                    | Makes you type DELETE, then asks again, then signs you out |
| Switch the emulator to dark mode                | Whole app follows                                          |
| Close and reopen the app                        | Still signed in, straight to Home                          |

If you delete your account you can sign up again with the same email — it
starts fresh.

---

## 6. Phase 1: fill the map with study spots

The app knows how to show study spots, but your database has none yet. The
seed script pulls them from OpenStreetMap and adds the campus places I
curated by hand.

### Get the service role key

The seed script writes places directly, which your own security rules block —
they only let a signed-in person add a place under their own name. That is
correct and not worth weakening for a one-off script, so the script uses the
**service_role** key, which bypasses the rules.

1. Supabase dashboard -> **Project Settings** -> **API Keys**.
2. Copy the key marked **service_role** (it is hidden behind a "Reveal"
   button, because it is the dangerous one).
3. Add it to `.env` as a new line:

   ```
   SUPABASE_SERVICE_ROLE_KEY=paste-it-here
   ```

> Note there is **no** `EXPO_PUBLIC_` on the front of that name. Anything
> starting with `EXPO_PUBLIC_` gets baked into the app that ships to phones,
> where anyone can read it. This key must never go there. `.env` is already
> ignored by git, so it will not reach GitHub either.

### Get the Google Maps key (Android only)

The map is drawn by Google Maps on Android, and **Google Maps shows a blank
grey screen without an API key, with no error telling you why**. iOS uses
Apple Maps and needs nothing. Since we are testing on an Android emulator,
you need this.

1. Go to <https://console.cloud.google.com> and sign in.
2. Create a project if you have none: the project dropdown at the top left ->
   **New Project** -> name it `locus` -> **Create**. Wait for it to switch.
3. In the search bar at the top, type **Maps SDK for Android**, open it, and
   click **Enable**.
   - It will ask you to set up billing first. You have to give card details,
     but Maps has a free monthly usage allowance that development traffic
     will not come close to. If that still makes you uneasy, set a cap under
     **Google Maps Platform -> Quotas**.
4. Go to **APIs & Services -> Credentials**.
5. **Create credentials -> API key**. Copy the key it shows you.
6. Click **Edit API key** on the key you just made and, under **API
   restrictions**, choose **Restrict key** and tick only **Maps SDK for
   Android**. Save.
   - This means a leaked key can only draw maps, not run up a bill on other
     Google services. Locking it to a specific app as well needs a signing
     fingerprint we will not have until we make real builds in Phase 9.
7. Add it to `.env`:

   ```
   GOOGLE_MAPS_ANDROID_API_KEY=paste-it-here
   ```

### Run it

```bash
npm run seed:places
```

It takes a minute. You should see something like:

```
  13 places from seed/manual_places.json
  querying OpenStreetMap...
  OpenStreetMap returned 211 results
  175 usable study spots after filtering

  181 places to import:
    cafe         114
    classroom    6
    dining_hall  4
    library      29
    outdoor      28
    with hours   58
```

OpenStreetMap's free servers are often busy; the script tries three mirrors
and backs off before giving up. If it fails anyway, wait a few minutes and run
it again, or run `npm run seed:places -- --manual-only` to import just the 13
campus spots.

Running it twice is safe: places are matched on their OpenStreetMap id, so a
second run updates rather than duplicates.

### Adding spots by hand

`seed/manual_places.json` is yours to extend — college common rooms, specific
floors, anywhere OpenStreetMap misses. The file explains each field at the
top. Opening hours are deliberately left blank on the entries I added: I would
rather the app say "Hours not known" than confidently tell someone a library
is open when it is shut. Fill them in as you confirm them.

### What you should be able to test

| Thing to try         | What should happen                                 |
| -------------------- | -------------------------------------------------- |
| Map tab              | Pins across campus, each with its category icon    |
| Tap a category chip  | Map filters to just those                          |
| Tap a pin            | A card slides in at the bottom                     |
| Closed places        | Faded, not hidden                                  |
| Discover tab         | Spots sorted by a mix of distance and rating       |
| "Open now" chip      | Only currently-open spots                          |
| Allow location       | Distances and walking times appear                 |
| Deny location        | Still works, sorted by rating alone                |
| Tap a spot           | Detail page: grade, crowd attributes, weekly hours |
| An unrated spot      | Shows a dash, not an F                             |
| Suggest a correction | Form submits, says thanks                          |
| Add a missing spot   | Pins it where you are standing                     |

---

## Things only you can do (accounts and approvals)

Nothing below blocks Phase 1, but some have long lead times, so start the ones
marked **start now**.

### Apple Developer Program — **start now**

- $99 USD/year, at <https://developer.apple.com/programs/>.
- Needed for: Sign in with Apple, TestFlight, and the App Store.
- Approval sometimes takes a few days, and everything iOS waits on it.

### Family Controls entitlement — **start now**

- This is what lets Locus lock distracting apps during a study session
  (Phase 7). Apple reviews the request by hand and it can take **weeks**.
- Request it at
  <https://developer.apple.com/contact/request/family-controls-distribution>
- You need the Apple Developer account above first.
- When they ask what you are building: Locus is a study-timer app that lets a
  student choose, themselves, which apps to block while their own study
  session is running, and unblocks them when they pause or finish.

### Google Cloud project — needed for "Continue with Google"

- Free, at <https://console.cloud.google.com>.
- You need an **iOS client ID** and a **Web client ID** from
  **APIs & Services → Credentials**, then paste them into `.env` as
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
- Also paste the **Web client ID** into Supabase under **Authentication →
  Sign In / Providers → Google**, and turn the provider on.
- Until you do this, the app simply hides the Google button. Email sign-in
  works regardless.

### Sign in with Apple in Supabase

- **Authentication → Sign In / Providers → Apple**, turn it on, and put
  `com.locusstudy.app` in the **Client IDs** field.
- The Apple button only works in a real development build on a real device —
  not in the simulator, and not in Expo Go.

### Make yourself an admin

Once you have signed in at least once, run this in the Supabase dashboard
under **SQL Editor** to give yourself access to the anti-cheat review view:

```sql
insert into app_admins (user_id)
select id from auth.users where email = 'your@email.com';
```

### Google Play developer account — later

- $25 USD one-time. Not needed until Phase 9, but worth knowing: a new
  personal account must run a closed test with **at least 12 testers opted in
  for 14 consecutive days** before Google will let you publish publicly. That
  clock is worth starting early.

### Before the App Store (Phase 9)

- A real privacy policy and terms, reviewed by someone qualified. The ones in
  the app now are honest placeholders describing what the app actually does,
  which makes a decent starting point.
- A publicly reachable privacy policy URL.
- A contact email to put in both documents.
