import { Injectable } from '@angular/core';

/**
 * SchemaDataService
 * ---------------------------------------------------------------------------
 * Single source of truth for all Schema.org data objects used throughout
 * the Royal Nano Ceramic website.
 *
 * Business details (name, URL, phone, socials) are maintained here so any
 * change propagates to every page automatically.
 * ---------------------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class SchemaDataService {
  // ─── Site-wide constants ────────────────────────────────────────────────────

  readonly siteUrl = 'https://royalnanoceramic.com';
  readonly siteName = 'Royal Nano Ceramic';
  readonly logoUrl = 'https://royalnanoceramic.com/assets/images/logo.png';
  readonly phone = '+201234567890';
  readonly email = 'info@royalnanoceramic.com';

  readonly sameAs: string[] = [
    'https://www.facebook.com/RoyalNanoCeramic.Egypt',
    'https://www.instagram.com/royal.nano.ceramic',
    'https://www.linkedin.com/company/royal-nano-ceramic/',
    'https://www.youtube.com/@RoyalNanoCeramic',
  ];

  // ─── Organization Schema ────────────────────────────────────────────────────

  /**
   * https://schema.org/Organization
   * Use on the Homepage.
   */
  getOrganizationSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.siteName,
      url: this.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: this.logoUrl,
        width: 200,
        height: 200,
      },
      description:
        'Leading provider of car paint protection films and nano ceramic coating services in Egypt. Premium quality with long-lasting results.',
      foundingDate: '2014',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: this.phone,
        email: this.email,
        contactType: 'customer service',
        areaServed: 'EG',
        availableLanguage: ['Arabic', 'English'],
      },
      areaServed: {
        '@type': 'Country',
        name: 'Egypt',
      },
      sameAs: this.sameAs,
    };
  }

  // ─── LocalBusiness Schema ───────────────────────────────────────────────────

  /**
   * https://schema.org/LocalBusiness
   * Use on the Homepage and Contact page.
   */
  getLocalBusinessSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',          // More specific sub-type of LocalBusiness
      name: this.siteName,
      description:
        'Experts in car paint protection films and nano ceramic coatings. Scratch resistance, weather protection, long-lasting shine, and premium quality service.',
      url: this.siteUrl,
      logo: this.logoUrl,
      image: this.logoUrl,
      telephone: this.phone,
      email: this.email,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG',
        addressLocality: 'Cairo',
        addressRegion: 'Cairo Governorate',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '30.0444',
        longitude: '31.2357',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday',
            'Friday', 'Saturday', 'Sunday',
          ],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      priceRange: '$$',
      paymentAccepted: 'Cash, Credit Card, Bank Transfer',
      currenciesAccepted: 'EGP, USD, EUR',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Car Protection Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Nano Ceramic Coating',
              description: 'Advanced nano ceramic coating for car paint protection with 9H+ hardness',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Graphene Coating',
              description: 'Premium graphene coating for superior hydrophobic protection',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Paint Protection Film (PPF)',
              description: 'Self-healing paint protection film installation for full body coverage',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Thermal Window Insulation',
              description: 'Premium UV-blocking window tint and thermal insulation films',
            },
          },
        ],
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '500',
        bestRating: '5',
        worstRating: '1',
      },
      sameAs: this.sameAs,
    };
  }

  // ─── Breadcrumb Schema ──────────────────────────────────────────────────────

  /**
   * https://schema.org/BreadcrumbList
   * @param items  Array of { name, url } in order (Home → Section → Page)
   */
  getBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  // ─── FAQ Schema ─────────────────────────────────────────────────────────────

  /**
   * https://schema.org/FAQPage
   * @param questions  Array of { question, answer }
   */
  getFaqSchema(
    questions: Array<{ question: string; answer: string }>
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    };
  }

  // ─── Pre-built FAQ sets ─────────────────────────────────────────────────────

  /** FAQ questions for the Services page */
  getServicesFaqItems(): Array<{ question: string; answer: string }> {
    return [
      {
        question: 'What is Nano Ceramic Coating?',
        answer:
          'Nano Ceramic Coating is a liquid polymer that chemically bonds with the vehicle\'s factory paint, providing a layer of protection. It creates a permanent or semi-permanent bond with the surface, offering 9H hardness and superior hydrophobic properties that repel water, dirt, and contaminants.',
      },
      {
        question: 'How long does Nano Ceramic Coating last?',
        answer:
          'Depending on the product grade, Royal Nano Ceramic coatings last between 5 to 12 years. Our Diamond Hybrid+ and Graphene Hybrid Plus packages offer up to 12-year warranties.',
      },
      {
        question: 'What is Paint Protection Film (PPF)?',
        answer:
          'Paint Protection Film (PPF) is a thermoplastic urethane film applied to painted surfaces. It is self-healing, meaning minor scratches disappear with heat exposure. PPF provides the highest level of physical protection against stone chips, scratches, and road debris.',
      },
      {
        question: 'How long does PPF installation take?',
        answer:
          'Full vehicle PPF installation typically takes 3–5 days depending on the vehicle size and the coverage areas selected. Partial installations (bumper, hood, mirrors) can be completed within 1–2 days.',
      },
      {
        question: 'Can I wash my car after ceramic coating?',
        answer:
          'You should avoid washing your car for the first 7 days after ceramic coating application to allow full curing. After the curing period, regular hand washing and periodic maintenance washes are recommended to maintain the coating\'s performance.',
      },
      {
        question: 'Do you offer a warranty on your services?',
        answer:
          'Yes, all Royal Nano Ceramic services come with a product warranty ranging from 1 to 12 years depending on the chosen package. Warranty covers defects in the coating performance under normal conditions.',
      },
      {
        question: 'What is thermal window insulation?',
        answer:
          'Thermal window insulation (window tinting) uses specialized films that block UV rays and heat, reducing interior cabin temperature, protecting upholstery, and improving driving comfort. Our films offer UV rejection rates up to 99%.',
      },
      {
        question: 'Is Graphene Coating better than Ceramic Coating?',
        answer:
          'Graphene coating builds on ceramic coating technology by adding graphene — a carbon-based nano-material — which provides superior hardness (10H+), better heat dissipation, improved hydrophobicity, and longer durability compared to standard ceramic coatings.',
      },
    ];
  }

  /** FAQ questions for the Home page */
  getHomeFaqItems(): Array<{ question: string; answer: string }> {
    return [
      {
        question: 'What services does Royal Nano Ceramic offer?',
        answer:
          'Royal Nano Ceramic offers Nano Ceramic Coating, Graphene Coating, Paint Protection Film (PPF), and Thermal Window Insulation services for all vehicle types.',
      },
      {
        question: 'Where is Royal Nano Ceramic located?',
        answer:
          'Royal Nano Ceramic is based in Cairo, Egypt, and serves clients across the country with premium car protection services.',
      },
      {
        question: 'How do I book a service?',
        answer:
          'You can book a service by visiting our website at royalnanoceramic.com, calling us directly, or messaging us on WhatsApp or social media.',
      },
      {
        question: 'How long has Royal Nano Ceramic been in business?',
        answer:
          'Royal Nano Ceramic has been providing premium car protection services since 2014, with over 10 years of experience in the industry.',
      },
    ];
  }

  // ─── WebSite Schema ─────────────────────────────────────────────────────────

  getWebsiteSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.siteUrl,
      description:
        'Experts in car paint protection films and nano ceramic coatings in Egypt.',
      inLanguage: ['ar', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.siteUrl}/services?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }
}
