export interface Business {
    // Basic info
    niche: string;
    business_name: string;
    domain: string;
    homepage: string;

    // Contact info
    contact_url?: string;
    email_primary?: string;
    email_all: string[];
    phone?: string;

    // Feature detection
    has_booking: boolean;
    has_chat: boolean;
    has_instant_quote: boolean;
    instant_quote_services: string[];

    // CMS
    is_wordpress: boolean;
    cms?: string;

    // Form analysis
    form_inputs: number;
    form_required: number;
    has_file_upload: boolean;

    // Mobile/UX signals
    mobile_meta_viewport: boolean;
    html_kb: number;

    // Ads/marketing signals (opportunity gaps)
    has_ga?: boolean;
    has_gtm?: boolean;
    has_google_ads_tag?: boolean;
    has_meta_pixel?: boolean;
    has_privacy_policy?: boolean;
    has_terms?: boolean;

    // Scoring
    friction_score: number;
    score_band: 'A' | 'B' | 'C' | 'D';

    // Metadata
    notes: string;
    crawled_at: Date;
    region?: string;
}

export interface SeedBusiness {
    name: string;
    domain?: string;
    possible_site_url?: string;
    niche: string;
    city: string;
    region?: string;
    phone?: string;
    email?: string;
    source?: string;
}

export interface CrawlResult {
    success: boolean;
    business?: Business;
    error?: string;
    url: string;
}

export interface HeuristicResult {
    has_booking: boolean;
    booking_services: string[];
    has_chat: boolean;
    chat_services: string[];
    has_instant_quote: boolean;
    instant_quote_services: string[];
    is_wordpress: boolean;
    cms?: string;
    emails: string[];
    phones: string[];
    form_inputs: number;
    form_required: number;
    has_file_upload: boolean;
    mobile_meta_viewport: boolean;
    html_size_bytes: number;
    contact_urls: string[];
    // Ads/marketing signals (opportunity gaps)
    has_ga: boolean;
    has_gtm: boolean;
    has_google_ads_tag: boolean;
    has_meta_pixel: boolean;
    has_privacy_policy: boolean;
    has_terms: boolean;
}

export interface ScoringFactors {
    no_booking: boolean;
    long_form: boolean;
    no_chat: boolean;
    no_phone_link: boolean;
    no_email: boolean;
    no_file_upload: boolean;
    poor_mobile: boolean;
    has_online_booking: boolean;
    has_chat_widget: boolean;
    no_instant_quote: boolean;
    has_instant_quote_widget: boolean;
}

export interface CrawlerConfig {
    concurrency: number;
    delay_min_ms: number;
    delay_max_ms: number;
    timeout_ms: number;
    user_agent: string;
    respect_robots: boolean;
    cache_results: boolean;
}

export interface ExportOptions {
    format: 'csv' | 'jsonl' | 'both';
    output_dir: string;
    filename_prefix: string;
    include_debug: boolean;
}

export const NICHES = [
    'roofing',
    'hvac',
    'remodeling',
    'landscaping',
    'tree',
    'pest'
] as const;

export type Niche = typeof NICHES[number];

export const REGIONS = [
    'Harford County, MD',
    'Baltimore County, MD',
    'Baltimore City, MD',
    'Anne Arundel County, MD',
    'Howard County, MD',
    'Montgomery County, MD'
] as const;

export type Region = typeof REGIONS[number];


