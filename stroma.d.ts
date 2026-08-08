interface StromaOptions {
  title: string;
  description: string;

  url?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;

  siteName?: string;
  author?: string;
  keywords?: string | string[];

  /** BCP 47 / Open Graph locale string. Default: 'en_US'. */
  locale?: string;
  robots?: string;
  themeColor?: string;
  canonical?: string;

  /** Open Graph type. Default: 'website'. */
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;

  /**
   * JSON-LD schema type to generate.
   * - 'webpage'    → schema.org/WebPage (default)
   * - 'article'    → schema.org/Article
   * - 'product'    → schema.org/Product
   * - 'breadcrumb' → schema.org/BreadcrumbList (requires breadcrumb array)
   */
  schema?: 'webpage' | 'article' | 'product' | 'breadcrumb';
  
  datePublished?: string;
  dateModified?: string;
  
  price?: number;
  priceCurrency?: string;
  
  breadcrumb?: Array<{ name: string; url: string }>;
  
  pwa?: boolean;
  appName?: string;
  logo?: string;
  
  maxTitleLength?: number;
  
  maxDescriptionLength?: number;
}

interface StromaDefaults {
  maxTitleLength:       number;
  maxDescriptionLength: number;
  robots:      string;
  ogType:      string;
  locale:      string;
  imageWidth:  string;
  imageHeight: string;
}

interface StromaInstance {
  
  init(options: StromaOptions): this;
  
  update(patch: Partial<StromaOptions>): this;
  
  reset(): this;
  
  getConfig(): StromaOptions & { titleFull: string; descriptionFull: string; twitterCard: string };
  
  renderToString(options: StromaOptions): string;
  
  breadcrumb(items: Array<{ name: string; url: string }>): this;
  
  defaults(patch: Partial<StromaDefaults>): this;
  defaults(): StromaDefaults;

  readonly version: string;
}

declare const Stroma: StromaInstance;

export { Stroma, type StromaDefaults, type StromaInstance, type StromaOptions, Stroma as default };
