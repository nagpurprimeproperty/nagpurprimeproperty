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
    metaTitle: 'Privacy Policy | PropertyConnect',
    metaDescription: 'Learn how PropertyConnect collects, uses, and protects your data.',
    content: `<h2>Privacy Policy</h2>
<p><strong>Last Updated: March 15, 2026</strong></p>
<h3>1. Information We Collect</h3>
<p>We collect phone numbers for OTP verification, names provided during enquiry, property search history, saved properties, and device analytics.</p>
<h3>2. How We Use Your Information</h3>
<p>Your information is used to verify identity, facilitate broker communication, personalize recommendations, and improve our services.</p>
<h3>3. Information Sharing</h3>
<p>We share your name and phone number ONLY with brokers you explicitly contact. We never sell your data to third parties.</p>
<h3>4. Data Security</h3>
<p>We implement industry-standard security measures including encryption in transit, secure infrastructure, and regular security audits.</p>
<h3>5. Your Rights</h3>
<p>You may request deletion of your account and associated data at any time by contacting support@propertyconnect.com.</p>`,
    isPublished: true,
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions | PropertyConnect',
    metaDescription: 'Read the terms and conditions for using PropertyConnect.',
    content: `<h2>Terms &amp; Conditions</h2>
<p><strong>Last Updated: March 15, 2026</strong></p>
<h3>1. Acceptance of Terms</h3>
<p>By accessing PropertyConnect, you agree to be bound by these Terms and Conditions.</p>
<h3>2. Description of Service</h3>
<p>PropertyConnect is a platform that connects property buyers with registered real estate brokers. We are not party to any transaction.</p>
<h3>3. User Accounts</h3>
<p>Users may browse without registration. To contact a broker, users must verify their mobile number via OTP.</p>
<h3>4. Property Listings</h3>
<p>Property information is provided by registered brokers. Users should verify all details independently.</p>
<h3>5. Prohibited Conduct</h3>
<p>Users must not misuse the platform, submit false enquiries, harass brokers, or bypass OTP verification.</p>
<h3>6. Limitation of Liability</h3>
<p>PropertyConnect is not liable for any transactions or disputes arising from interactions between users and brokers.</p>`,
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