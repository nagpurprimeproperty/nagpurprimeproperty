# App Store Submission Kit - Nagpur Prime Property

This document contains all the necessary assets, metadata, credentials, and step-by-step instructions to successfully submit the **Nagpur Prime Property** iOS app to Apple App Store Connect.

---

## 1. App Screenshots

The high-fidelity mockups representing the core views of the mobile app have been generated in your App Store assets folder. You can upload these directly in App Store Connect (under **iOS App** > **Screenshots** for 6.5" iPhone display / 5.5" iPhone display).

- **Explore Screen:** `explore_screen`
- **Search Screen:** `search_screen`
- **Detail Screen:** `detail_screen`
- **Add Listing Screen:** `add_listing_screen`
- **Subscription Screen:** `subscription_screen`

---

## 2. Promotional Text (Max 170 characters)
> Find your dream home, flat, plot, or commercial space in Nagpur. List properties, connect directly with verified owners & brokers, and get real-time lead updates!

---

## 3. Description (Max 4000 characters)
```text
Welcome to Nagpur Prime Property, the leading real estate search and listing platform dedicated exclusively to Nagpur, India. Whether you are looking to buy, rent, or sell residential and commercial properties, our app provides a seamless, hyper-local experience tailored to Nagpur's property market.

Key Features:

• Extensive Local Listings: Explore a wide selection of flats, apartments, independent houses, luxury villas, residential plots, offices, shops, and commercial spaces across Nagpur.
• Hyper-Local Search & Filters: Refine your search in prime localities like Besa, Manish Nagar, Wardha Road, Sadar, Dighori, Dhantoli, Dharampeth, and more. Filter by BHK configurations, budget range, carpet area, and exact amenities.
• Interactive Map Search: Locate properties easily using our integrated map picker and view pricing pins across various sectors of the city.
• Direct Enquiry: Instantly connect with property owners, builders, or brokers. Submit enquiries directly with custom notes to get prompt callbacks.
• Easy Listing Wizard: Are you a seller, owner, or broker? List your property in minutes using our step-by-step wizard. Upload photos, input property specifications, drop a pin on the map, and set your price.
• Manage Listings & Leads: Monitor views, manage received leads, and follow up with enquiries directly from your personal dashboard.
• Saved Properties: Bookmark listings that catch your eye and review them later at your convenience.
• Premium Membership Plans: Boost your visibility! Purchase Standard, Premium, or Platinum plans to post featured properties, view detailed analytics, and unlock premium lead-matching notifications.

Find flats, sell land, or rent commercial office spaces in Nagpur. Download Nagpur Prime Property today to begin your real estate journey!
```

---

## 4. Keywords (Max 100 characters)
> `nagpur real estate,buy flats nagpur,rent flats nagpur,villas in nagpur,nagpur property,plots sale nagpur,office space nagpur,property dealer nagpur,broker` *(99 characters)*

---

## 5. Support URL
> **`https://nagpurprimeproperty.com/about-us`**
*(Note: Change this to `https://nagpurprimeproperty.com/contact` if you prefer to redirect reviewers to a contact form page).*

---

## 6. Marketing URL
> **`https://nagpurprimeproperty.com`**

---

## 7. App Privacy
Under **App Privacy** in App Store Connect, configure the following disclosures:

* **Privacy Policy URL**: `https://nagpurprimeproperty.com/privacy-policy`
* **Data Collection settings**:
  * Select **"Yes, we collect data from this app"** and fill out the questionnaire as follows:
    * **Contact Info** (Name, Phone number, Email): Used for registration, account setup, and property enquiries. (Linked to User, Not used for tracking).
    * **Location** (Coordinates): Used for picking map pins when uploading listings. (Linked to User, Not used for tracking).
    * **User Content** (Photos, listing details): Collected when the user uploads property pictures. (Linked to User, Not used for tracking).
    * **Device ID** (FCM Push tokens): Used to deliver real-time enquiry alerts and subscription updates. (Linked to User, Not used for tracking).
    * **Diagnostics** (Crash/performance logs): Used to identify and fix issues. (Not linked to User, Not used for tracking).

---

## 8. Age Rating
In App Store Connect, complete the Age Rating questionnaire. It should result in **4+** (No mature content).
* **Unrestricted Web Access**: No (unless the app features an open web browser; the embedded map view is restricted).
* **Violence/Gore/Sexual Content/Alcohol/Drugs**: Select **None** for all categories.

---

## 9. App Review Information
This information is exclusively for Apple's App Review team and will not be displayed on the App Store.

* **Contact Information**:
  * **First Name**: Ayush
  * **Last Name**: Bharne
  * **Email**: support@nagpurprimeproperty.com
  * **Phone**: +91 9999999999 *(Provide your actual active contact number)*
* **Review Notes / Sign-In Instructions**:
  > The application uses a secure mobile phone OTP (One-Time Password) authentication flow.
  > 
  > For the convenience of the App Review team, our staging environment is configured to bypass SMS delivery. When requesting an OTP for login, **the active OTP code is dynamically returned in the server response and displayed as a temporary toast message at the top of the mobile screen**.
  > 
  > To sign in:
  > 1. Enter the demo phone number provided below.
  > 2. Tap "Send OTP".
  > 3. Enter the 4-digit code displayed in the toast notification (e.g. `1234` or similar) to complete authentication.

---

## 10. Demo Login Account
* **Phone Number**: `9999999999` (or `+91 9999999999`)
* **Verification Code (OTP)**: *Displayed in the top toast message during request*

---

## 11. Select Build 1.0.0 (2)
To link your build:
1. Ensure your version is bumped to `1.0.0` and build number to `2` in `app.json` or `app.config.js`.
2. Generate your iOS build using EAS Build:
   ```bash
   eas build --platform ios
   ```
3. Once the build completes, download the `.ipa` file or configure automatic submission using `eas submit` or upload the `.ipa` using the **Transporter** app on macOS.
4. Go to App Store Connect, select your app, navigate to **Builds**, click the `+` icon, and select the uploaded build **1.0.0 (2)**.

---

## 12. Add for Review
Once all details are saved:
1. Verify all screenshots are uploaded for 6.5" and 5.5" displays.
2. Verify contact info, support URL, and marketing URL are valid.
3. Click the **Save** button in the top right.
4. Click **Add for Review**.
5. Respond to standard export compliance questions (select "No" for encryption questions, as standard HTTPS doesn't require extra paperwork).
6. Click **Submit to App Review**.
