import StaticPage from '../../models/static-page.model.js';

const ABOUT_DEFAULT_DATA = {
  type: 'about',
  version: '1.0.0',
  tagline: 'Connecting Buyers with Trusted Brokers',
  mission:
    'PropertyConnect aims to simplify the property search experience by connecting buyers directly with verified and trusted real estate brokers. We believe in transparency, trust, and making homeownership accessible to everyone.',
  whatWeOffer: [
    'Thousands of verified property listings',
    'Direct broker connections with OTP verification',
    'Smart search with advanced filters',
    'Save favorites and track enquiries',
    'Price alerts and new listing notifications',
  ],
  stats: { properties: '10K+', brokers: '500+', users: '50K+', cities: '15+' },
  contactInfo: {
    website: 'www.propertyconnect.com',
    email: 'info@propertyconnect.com',
    phone: '+91 98765 43210',
    address: 'Pune, Maharashtra, India',
    facebook: '',
    instagram: '',
    youtube: '',
  },
  bannerImage: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1536&q=80',
  bannerHeading: 'Find your next home in',
  bannerHeadingHighlight: 'Nagpur',
  bannerSubheading: 'Verified flats, plots and villas across Dighori, MIHAN, Wardha Road and more. Direct contact with trusted brokers — no middlemen, no spam.',
};

const CONTACT_DEFAULT_DATA = {
  type: 'contact',
  phone: '+91 98765 43210',
  email: 'support@propertyconnect.com',
  whatsapp: '+91 98765 43210',
  supportHours: 'Monday - Saturday, 9:00 AM - 7:00 PM IST',
  faqs: [
    { id: '1', question: 'How do I search for properties?', answer: 'Use the search bar and apply filters like location, budget, and property type.' },
    { id: '2', question: 'How do I contact a broker?', answer: "Open any listing and tap \"Contact Broker\". You'll need to verify your mobile via OTP." },
    { id: '3', question: 'What does saving a property do?', answer: 'Saved properties are stored in your favorites for easy access later.' },
    { id: '4', question: 'Is my phone number shared with brokers?', answer: 'Only with brokers you explicitly contact through our enquiry form.' },
    { id: '5', question: 'How do featured properties work?', answer: 'Featured properties get priority placement in search results and are verified by our team.' },
    { id: '6', question: 'Can I schedule a property visit?', answer: 'Yes, after contacting a broker you can arrange a visit directly with them.' },
  ],
};

// Default seeds for each page type
const DEFAULT_PAGES = {
  'about-us': {
    slug: 'about-us',
    title: 'About Us',
    metaTitle: 'About Us | PropertyConnect',
    metaDescription: "Learn about PropertyConnect, India's trusted real estate platform.",
    content: JSON.stringify(ABOUT_DEFAULT_DATA),
    isPublished: true,
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | Nagpur Prime Property',
    metaDescription: 'Learn how Nagpur Prime Property collects, uses, and protects your data.',
    content: `<h2>Privacy Policy</h2>
<p><strong>Last Updated: March 15, 2026</strong></p>
<h3>1. Introduction</h3>
<p>Welcome to Nagpur Prime Property ("Company," "we," "us," or "our"). We operate the website located at <a href="https://nagpurprimeproperty.com">https://nagpurprimeproperty.com</a> and any related applications (collectively, the "Platform"), through which registered Users (including property Sellers, Buyers, and Brokers/Agents) can list, discover, and transact in real estate properties, and through which we operate a subscription-based listing and lead-unlock model.</p>
<p>This Privacy Policy explains how we collect, use, store, share, and protect your personal data when you access or use the Platform or our services (the "Services"). It applies to all users of the Platform, including property Sellers, property Buyers, brokers/agents, and general visitors.</p>
<p>By registering on, accessing, or using the Platform, you agree to the collection and use of your information as described in this Policy. Where required by applicable law, we will seek your specific consent before processing certain categories of personal data.</p>
<p>This Policy should be read together with our Terms of Use. Any capitalized term not defined here has the meaning given to it in our Terms of Use.</p>

<h3>2. Information We Collect</h3>
<h4>A. Information You Provide to Us</h4>
<ul>
  <li><strong>Account &amp; Profile Information:</strong> Name, mobile phone number, email address (optional), city, area, address, and profile avatar image, provided when you register or update your account.</li>
  <li><strong>OTP Authentication Credentials:</strong> One-Time Passwords (OTPs) sent to your registered mobile number for authentication. We do not collect or store passwords.</li>
  <li><strong>Property Listing Information:</strong> Property type, listing category (Resale, Rent, New Project), location (locality, sub-locality, landmark, pin code, and geographical coordinates), price (total price, monthly rent, security deposit, etc.), property specifications (BHK, bathrooms, carpet area, furnishing, amenities), photographs, videos, and optional details (such as RERA registration status, NA plot order details, and 7/12 extract status for agricultural land).</li>
  <li><strong>Subscription &amp; Billing Information:</strong> Details of subscription plans purchased, payment transaction references, and billing details. Payments are processed through third-party, PCI-DSS-compliant payment gateway (Razorpay); we do not store your full card, bank account, or UPI details.</li>
  <li><strong>Enquiry &amp; Lead Details:</strong> Records of properties you have enquired about, leads unlocked, and communications between users.</li>
</ul>
<p><strong>Note:</strong> We do NOT collect, upload, or store copies of government identity cards (such as Aadhaar, PAN, passport, or voter ID) or physical property ownership deeds (such as sale deeds or tax bills) on our servers.</p>

<h4>B. Information Collected Automatically</h4>
<ul>
  <li><strong>Usage Data:</strong> Search queries, pages viewed, listings saved or contacted, time spent on the Platform, and inferred preferences.</li>
  <li><strong>Technical Data:</strong> IP address, device identifiers, device model, operating system, browser type, and network information.</li>
  <li><strong>Location Data:</strong> City/region-level location inferred from your IP address, or precise device location (coordinates) with your permission.</li>
  <li><strong>Cookies and Similar Technologies:</strong> Used to recognize returning users, remember preferences, and analyze Platform performance.</li>
</ul>

<h4>C. Information from Third Parties</h4>
<p>Information received from identity verification partners, marketing partners, or from your use of third-party login options (where applicable).</p>

<h3>3. How We Use Your Information</h3>
<p>We use your personal data to:</p>
<ol>
  <li>Create and manage your account, verified via mobile OTP.</li>
  <li>Publish and display property listings, and enable buyers to search, filter, and shortlist properties.</li>
  <li>Facilitate communication and connection between Buyers and Brokers/Sellers on the Platform by enabling lead unlocking.</li>
  <li>Process subscription payments and collect plan fees via Razorpay, including generating invoices and payment records.</li>
  <li>Verify listings and users to detect and prevent fraud, misrepresentation, or duplicate/fake listings.</li>
  <li>Provide support and resolve grievances raised by users or third parties.</li>
  <li>Send transactional communications (e.g., subscription expiry alerts, payment confirmations, account notifications) and promotional messages.</li>
  <li>Improve and optimize the Platform, including analytics, troubleshooting, and personalizing your experience.</li>
  <li>Comply with tax, accounting, and legal requirements.</li>
</ol>

<h3>4. Subscription and Lead Data</h3>
<p>As a listing directory, we retain records of active and expired subscription plans, transaction details (processed via Razorpay), property listings, and lead unlock history. This data is retained for accounting, tax, audit, and legal compliance purposes.</p>

<h3>5. Cookies</h3>
<p>We use cookies to keep you logged in, remember your preferences, and understand how users navigate the Platform. You can manage or disable cookies through your browser settings, though it may affect certain Platform features.</p>

<h3>6. How We Share Your Information</h3>
<p>We do not sell your personal data. We share your information in the following circumstances:</p>
<ul>
  <li><strong>Between Buyers/Tenants and Brokers/Sellers:</strong> When a registered Buyer/Tenant explicitly requests or unlocks contact details for a property listing, their name and OTP-verified mobile number are shared with the Broker/Seller of that listing. Similarly, the Broker's/Seller's contact details are unlocked and shared with the Buyer.</li>
  <li><strong>Service Providers:</strong> With payment gateways (Razorpay), cloud hosting providers (e.g., AWS S3 for media uploads), SMS/email service providers, and support vendors who process data on our behalf under confidentiality obligations.</li>
  <li><strong>Legal &amp; Regulatory Authorities:</strong> Where required to comply with a legal obligation, court order, or government request, or to protect the safety, rights, or property of the Company, our users, or the public.</li>
  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, subject to the acquiring entity honoring the commitments of this Policy.</li>
</ul>

<h3>7. Data Storage, Security, and Retention</h3>
<p>Your data is stored on secure cloud servers in India. We implement reasonable technical and organizational security measures—including secure OTP authentication, data encryption, access controls, and secure servers—to protect your data. We retain personal data for as long as necessary to provide the Services, maintain listing directories, and comply with applicable legal, tax, and accounting requirements.</p>

<h3>8. Your Rights</h3>
<p>Subject to applicable law, you may access, correct, or delete your personal data, or request account deletion, subject to our legal retention obligations. To exercise these rights, please write to us at support@nagpurprimeproperty.com.</p>

<h3>9. Children's Privacy</h3>
<p>The Platform is intended for use only by individuals who are 18 years of age or older. We do not knowingly collect personal data from anyone under 18.</p>

<h3>10. Grievance Redressal / Contact Us</h3>
<p>If you have any questions, concerns, or complaints about this Privacy Policy or how your personal data is handled, please contact our Grievance Officer:</p>
<p>
  <strong>Grievance Officer:</strong> Grievance Desk<br />
  <strong>Company:</strong> Nagpur Prime Property<br />
  <strong>Address:</strong> Wardha Road, Nagpur 440015, Maharashtra<br />
  <strong>Email:</strong> support@nagpurprimeproperty.com<br />
  <strong>Phone:</strong> +91 98765 43210
</p>`,
    isPublished: true,
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions | Nagpur Prime Property',
    metaDescription: 'Read the terms and conditions for using Nagpur Prime Property.',
    content: `<h2>Terms &amp; Conditions</h2>
<p><strong>Last Updated: March 15, 2026</strong></p>

<h3>1. Introduction and Acceptance</h3>
<p>These Terms of Use ("Terms") govern your access to and use of Nagpur Prime Property ("Company," "we," "us," or "our"), including our website located at <a href="https://nagpurprimeproperty.com">https://nagpurprimeproperty.com</a> and related applications (collectively, the "Platform").</p>
<p>The Platform enables registered Brokers, Agents, and Sellers to list properties and enables Buyers/Tenants to search and connect with them. The Platform operates on a subscription-based listing and lead-unlock model.</p>
<p>By accessing or using the Platform, creating an account, or availing any of our services, you agree to be bound by these Terms and by our Privacy Policy, which is incorporated herein by reference. If you do not agree to these Terms, please do not use the Platform.</p>

<h3>2. Eligibility</h3>
<p>To use the Platform, you must be at least 18 years of age, capable of entering into a legally binding contract under applicable law, and provide accurate, current, and complete information during registration.</p>

<h3>3. Account Registration &amp; Authentication</h3>
<p>Registration and login are verified using One-Time Passwords (OTPs) sent to your mobile phone number. You are responsible for all activities that occur under your account. You agree to provide true, accurate, and verifiable identity and property information. We reserve the right to suspend or terminate accounts found to contain false or misleading information.</p>

<h3>4. Role of the Company</h3>
<p>Nagpur Prime Property operates solely as a marketplace and listing directory connecting Buyers/Tenants with Brokers, Agents, and Sellers. The Company is not a party to, and does not guarantee, any sale, lease, or transaction entered into between users.</p>
<p>The Company does not own, inspect, hold title to, or verify the legal status or physical condition of any property listed on the Platform. All negotiations, agreements, and transactions are entered into directly between the users at their own risk. Users are strongly encouraged to conduct independent due diligence (including legal, title, and physical verification) before finalizing any transaction.</p>
<p><strong>No Deal Commissions:</strong> The Company does NOT charge any transaction-based commissions or brokerage fees on real estate deals concluded between users.</p>

<h3>5. Subscription Plans, Lead Unlocks, and Payments</h3>
<p>To list properties or unlock lead contact details (buyer enquiries), users must purchase subscription plans as set out in our Fee Schedule. All payments are processed securely via Razorpay. All fees are exclusive of applicable taxes (e.g., GST) unless stated otherwise. Payments made for subscription packages, featured listings, or lead unlocks are final and non-refundable.</p>

<h3>6. Seller &amp; Broker Obligations</h3>
<p>By listing a property, you represent and warrant that you are the owner or have valid written authorization to list the property. All information provided must be true, accurate, and up-to-date. You must input valid RERA registration numbers where legally required. You must use unlocked buyer lead details solely for legitimate property matching and must not share or resell lead data.</p>

<h3>7. Buyer &amp; Tenant Obligations</h3>
<p>Buyers agree to conduct their own independent verification before entering into any transaction or making payments. Buyers must not use the Platform for harassment, spamming, or fraudulent conduct, and are responsible for the accuracy of their contact details.</p>

<h3>8. Prohibited Conduct</h3>
<p>Users must not post false, duplicate, or fraudulent listings; impersonate any person; upload unlawful content; attempt unauthorized access; scrape property listings or contact details; or misuse unlocked lead details. We reserve the right to suspend or terminate accounts for violations.</p>

<h3>9. Intellectual Property</h3>
<p>All content on the Platform (excluding user-submitted listing details and photos), including designs, logos, text, trademarks, and software, is owned by or licensed to the Company. You may not copy, reproduce, or distribute any part of the Platform without our prior written consent.</p>

<h3>10. Disclaimers</h3>
<p>The Platform is provided on an "as is" and "as available" basis. The Company makes no warranties, express or implied, regarding the accuracy, completeness, or reliability of any listing. The Company does not guarantee that any listing will remain available or lead to a completed transaction.</p>

<h3>11. Limitation of Liability</h3>
<p>The Company, its directors, and employees shall not be liable for indirect, incidental, or consequential damages; losses arising from inaccurate listing details; failed transactions; or unauthorized account access. The Company's total aggregate liability shall not exceed the subscription fees paid by you in the three (3) months preceding the claim.</p>

<h3>12. Indemnification</h3>
<p>You agree to indemnify and hold harmless the Company, its directors, and employees from any claims, damages, or losses arising out of your breach of these Terms, inaccurate listing info, disputes with other users, or violation of applicable laws (including RERA regulations).</p>

<h3>13. Suspension and Termination</h3>
<p>We may suspend or terminate your account with or without notice if you violate these Terms, provide false details, or pose a security risk. You may request account deletion by contacting support at support@nagpurprimeproperty.com.</p>

<h3>14. Dispute Resolution and Governing Law</h3>
<p>These Terms shall be governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Nagpur, Maharashtra. Any dispute shall first be attempted to be resolved through good-faith negotiation, failing which it shall be referred to binding arbitration seated at Nagpur, Maharashtra.</p>

<h3>15. Grievance Redressal</h3>
<p>For any complaints regarding the use of the Platform, please contact our Grievance Officer:</p>
<p>
  <strong>Grievance Officer:</strong> Grievance Desk<br />
  <strong>Company:</strong> Nagpur Prime Property<br />
  <strong>Address:</strong> Wardha Road, Nagpur 440015, Maharashtra<br />
  <strong>Email:</strong> support@nagpurprimeproperty.com<br />
  <strong>Phone:</strong> +91 98765 43210
</p>

<h3>16. Fee &amp; Subscription Plan Schedule</h3>
<p>Instead of transaction commissions, Nagpur Prime Property offers subscription packages for posting property listings and unlocking buyer leads. Please refer to your account dashboard for active packages and features, which include maximum property upload limits, featured property limits, and lead-unlock credits.</p>`,
    isPublished: true,
  },
  'contact-us': {
    slug: 'contact-us',
    title: 'Help & Support',
    metaTitle: 'Contact Us | PropertyConnect',
    metaDescription: 'Get in touch with the PropertyConnect support team.',
    content: JSON.stringify(CONTACT_DEFAULT_DATA),
    isPublished: true,
  },
};

const VALID_SLUGS = Object.keys(DEFAULT_PAGES);

const staticPageService = {
  /**
   * Get page by slug. Auto-seeds default if missing.
   */
  getBySlug: async (slug) => {
    if (!VALID_SLUGS.includes(slug)) {
      throw { status: 400, message: `Invalid page slug: "${slug}"` };
    }

    let page = await StaticPage.findOne({ slug });

    if (!page) {
      page = await StaticPage.create(DEFAULT_PAGES[slug]);
    }

    // Migrate old about-us / contact-us HTML to new JSON structure
    if (slug === 'about-us') {
      try {
        const parsed = JSON.parse(page.content);
        if (!parsed?.type) throw new Error('not structured');
      } catch {
        await StaticPage.findOneAndUpdate(
          { slug },
          { $set: { content: JSON.stringify(ABOUT_DEFAULT_DATA) } },
          { new: true }
        );
        page = await StaticPage.findOne({ slug });
      }
    }

    if (slug === 'contact-us') {
      try {
        const parsed = JSON.parse(page.content);
        if (!parsed?.type) throw new Error('not structured');
      } catch {
        await StaticPage.findOneAndUpdate(
          { slug },
          { $set: { content: JSON.stringify(CONTACT_DEFAULT_DATA) } },
          { new: true }
        );
        page = await StaticPage.findOne({ slug });
      }
    }

    return page;
  },

  /**
   * List all static pages.
   */
  listAll: async () => {
    const pages = await StaticPage.find().sort({ slug: 1 });
    // Seed missing ones
    for (const slug of VALID_SLUGS) {
      if (!pages.find((p) => p.slug === slug)) {
        await StaticPage.create(DEFAULT_PAGES[slug]);
      }
    }
    return StaticPage.find().sort({ slug: 1 });
  },

  /**
   * Update page content (admin only).
   */
  update: async (slug, payload) => {
    if (!VALID_SLUGS.includes(slug)) {
      throw { status: 400, message: `Invalid page slug: "${slug}"` };
    }

    const allowed = ['title', 'content', 'metaTitle', 'metaDescription', 'isPublished'];
    const update = {};
    for (const key of allowed) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }
    update.lastUpdated = new Date();

    const page = await StaticPage.findOneAndUpdate(
      { slug },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return page;
  },

  /**
   * Seed all defaults.
   */
  seedDefaults: async () => {
    const results = [];
    for (const [slug, data] of Object.entries(DEFAULT_PAGES)) {
      const existing = await StaticPage.findOne({ slug });
      if (!existing) {
        results.push(await StaticPage.create(data));
      }
    }
    return results;
  },
};

export default staticPageService;