import { HeuristicResult } from '@instantquote/core';
import { Page } from 'playwright';
import * as cheerio from 'cheerio';

/**
 * Extract all heuristics from a webpage
 */
export async function extractHeuristics(page: Page, html: string): Promise<HeuristicResult> {
    const $ = cheerio.load(html);

    // Booking detection
    const bookingResult = detectBookingServices($, page.url());

    // Chat detection  
    const chatResult = await detectChatServices(page, $);

    // Instant quote / estimator detection
    const instantQuoteResult = detectInstantQuote($, page.url());

    // CMS detection
    const cmsResult = detectCMS($, html);

    // Email extraction
    const emails = extractEmails($, html);

    // Phone extraction
    const phones = extractPhones($, html);

    // Form analysis
    const formAnalysis = analyzeContactForms($);

    // Mobile/UX signals
    const mobileSignals = analyzeMobileUX($, html);

    // Contact page URLs
    const contactUrls = findContactUrls($, page.url());

    // Ads/marketing signals (tracking + compliance)
    const adsSignals = detectAdsSignals($, html);

    return {
        has_booking: bookingResult.detected,
        booking_services: bookingResult.services,
        has_chat: chatResult.detected,
        chat_services: chatResult.services,
        has_instant_quote: instantQuoteResult.detected,
        instant_quote_services: instantQuoteResult.services,
        is_wordpress: cmsResult.is_wordpress,
        cms: cmsResult.cms,
        emails,
        phones,
        form_inputs: formAnalysis.inputs,
        form_required: formAnalysis.required,
        has_file_upload: formAnalysis.hasFileUpload,
        mobile_meta_viewport: mobileSignals.hasViewport,
        html_size_bytes: Buffer.byteLength(html, 'utf8'),
        contact_urls: contactUrls,
        ...adsSignals
    };
}

/**
 * Detect online booking services
 */
function detectBookingServices($: cheerio.CheerioAPI, currentUrl: string): { detected: boolean; services: string[] } {
    const services: string[] = [];

    // Known booking service domains
    const bookingDomains = [
        'calendly.com',
        'youcanbook.me',
        'housecallpro.com',
        'jobber.com',
        'squareup.com/appointments',
        'acuityscheduling.com',
        'setmore.com',
        'appointmentplus.com',
        'vagaro.com',
        'schedulicity.com'
    ];

    // Check for booking links
    $('a[href]').each((_, element) => {
        const href = $(element).attr('href') || '';
        const text = $(element).text().toLowerCase();

        // Check for booking service domains
        for (const domain of bookingDomains) {
            if (href.includes(domain)) {
                services.push(domain);
                break;
            }
        }

        // Check for booking-related text and URLs
        if (text.includes('book') || text.includes('schedule') || text.includes('appointment')) {
            if (href.includes('/book') || href.includes('/schedule') || href.includes('/appointment')) {
                services.push('custom_booking');
            }
        }
    });

    // Check for booking-related buttons and forms
    $('button, input[type="submit"]').each((_, element) => {
        const text = $(element).text().toLowerCase() || $(element).attr('value')?.toLowerCase() || '';
        if (text.includes('book now') || text.includes('schedule') || text.includes('get quote')) {
            services.push('booking_button');
        }
    });

    return {
        detected: services.length > 0,
        services: [...new Set(services)] // Remove duplicates
    };
}

/**
 * Detect instant quote / estimator tools (vendors and custom patterns)
 */
function detectInstantQuote($: cheerio.CheerioAPI, baseUrl: string): { detected: boolean; services: string[] } {
    const services: string[] = [];

    // Known vendor domains/keywords for estimators in roofing/HVAC
    const vendorPatterns = [
        'roofr.com',
        'hover.to',
        'eagleview',
        'servicetitan',
        'jobber.com/estimates',
        'housecallpro.com',
        'getheyo.com',
        'roofsnap',
        'roofer.com',
        'nearbynow',
        'callrail.com/forms'
    ];

    const keywords = [
        'instant quote',
        'instant estimate',
        'get quote',
        'get an estimate',
        'roof calculator',
        'roofing calculator',
        'hvac estimate',
        'ac estimate',
        'furnace estimate',
        'online quote',
        'price calculator'
    ];

    $('a[href], script[src], iframe[src]').each((_, el) => {
        const href = ($(el).attr('href') || $(el).attr('src') || '').toLowerCase();
        const text = $(el).text().toLowerCase();

        for (const vp of vendorPatterns) {
            if (href.includes(vp)) {
                services.push(vp);
                break;
            }
        }

        for (const kw of keywords) {
            if (href.includes('quote') && href.includes('instant')) {
                services.push('instant_quote_link');
                break;
            }
            if (text.includes(kw)) {
                services.push('instant_quote_keyword');
                break;
            }
        }
    });

    // Look for common on-page CTA buttons
    $('button, a').each((_, el) => {
        const t = ($(el).text() || '').toLowerCase().trim();
        if (t.includes('instant') && (t.includes('quote') || t.includes('estimate'))) {
            services.push('instant_quote_cta');
        }
        if ((t.includes('roof') && t.includes('calculator')) || t.includes('roofing calculator')) {
            services.push('roof_calculator');
        }
    });

    return { detected: services.length > 0, services: [...new Set(services)] };
}

/**
 * Detect chat services
 */
async function detectChatServices(page: Page, $: cheerio.CheerioAPI): Promise<{ detected: boolean; services: string[] }> {
    const services: string[] = [];

    // Check for chat widget scripts
    const chatScripts = [
        'tawk.to',
        'intercom',
        'crisp.chat',
        'zendesk',
        'drift.com',
        'livechat',
        'olark',
        'freshchat',
        'tidio'
    ];

    $('script').each((_, element) => {
        const src = $(element).attr('src') || '';
        const content = $(element).html() || '';

        for (const chatService of chatScripts) {
            if (src.includes(chatService) || content.includes(chatService)) {
                services.push(chatService);
            }
        }
    });

    // Check for common chat widget indicators in page content
    try {
        const hasIntercom = await page.evaluate(() => window.Intercom !== undefined);
        if (hasIntercom) services.push('intercom');
    } catch (e) {
        // Ignore evaluation errors
    }

    try {
        const hasCrisp = await page.evaluate(() => window.$crisp !== undefined);
        if (hasCrisp) services.push('crisp');
    } catch (e) {
        // Ignore evaluation errors
    }

    // Check for chat-related elements
    const chatSelectors = [
        '[id*="chat"]',
        '[class*="chat"]',
        '[id*="intercom"]',
        '[class*="intercom"]',
        '[id*="tawk"]',
        '[class*="tawk"]'
    ];

    for (const selector of chatSelectors) {
        if ($(selector).length > 0) {
            services.push('chat_widget');
            break;
        }
    }

    return {
        detected: services.length > 0,
        services: [...new Set(services)]
    };
}

/**
 * Extract email addresses
 */
function extractEmails($: cheerio.CheerioAPI, html: string): string[] {
    const emails = new Set<string>();

    // Extract from mailto links
    $('a[href^="mailto:"]').each((_, element) => {
        const href = $(element).attr('href') || '';
        const email = href.replace('mailto:', '').split('?')[0];
        if (isValidEmail(email)) {
            emails.add(email.toLowerCase());
        }
    });

    // Extract from text content using regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const textMatches = html.match(emailRegex) || [];

    for (const match of textMatches) {
        if (isValidEmail(match)) {
            emails.add(match.toLowerCase());
        }
    }

    // Handle common obfuscations
    const obfuscatedPatterns = [
        /(\w+)\s*\[at\]\s*(\w+(?:\.\w+)*)\s*\[dot\]\s*(\w+)/gi,
        /(\w+)\s*@\s*(\w+(?:\s*\.\s*\w+)*)/gi
    ];

    for (const pattern of obfuscatedPatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
            const email = match[0].replace(/\s*\[at\]\s*/gi, '@').replace(/\s*\[dot\]\s*/gi, '.').replace(/\s+/g, '');
            if (isValidEmail(email)) {
                emails.add(email.toLowerCase());
            }
        }
    }

    return Array.from(emails);
}

/**
 * Extract phone numbers
 */
function extractPhones($: cheerio.CheerioAPI, html: string): string[] {
    const phones = new Set<string>();

    // Extract from tel: links
    $('a[href^="tel:"]').each((_, element) => {
        const href = $(element).attr('href') || '';
        const phone = href.replace('tel:', '').replace(/[^\d+()-]/g, '');
        if (phone.length >= 10) {
            phones.add(phone);
        }
    });

    // Extract from text using regex
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const matches = html.matchAll(phoneRegex);

    for (const match of matches) {
        const phone = match[0].replace(/[^\d]/g, '');
        if (phone.length === 10 || (phone.length === 11 && phone.startsWith('1'))) {
            phones.add(match[0]);
        }
    }

    return Array.from(phones);
}

/**
 * Analyze contact forms
 */
function analyzeContactForms($: cheerio.CheerioAPI): { inputs: number; required: number; hasFileUpload: boolean } {
    let totalInputs = 0;
    let requiredInputs = 0;
    let hasFileUpload = false;

    // Count form inputs
    $('form').each((_, form) => {
        const $form = $(form);

        // Count input fields
        const inputs = $form.find('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
        const textareas = $form.find('textarea');
        const selects = $form.find('select');

        totalInputs += inputs.length + textareas.length + selects.length;

        // Count required fields
        requiredInputs += $form.find('input[required], textarea[required], select[required]').length;

        // Check for file uploads
        if ($form.find('input[type="file"]').length > 0) {
            hasFileUpload = true;
        }
    });

    return {
        inputs: totalInputs,
        required: requiredInputs,
        hasFileUpload
    };
}

/**
 * Analyze mobile UX signals
 */
function analyzeMobileUX($: cheerio.CheerioAPI, html: string): { hasViewport: boolean } {
    const hasViewport = $('meta[name="viewport"]').length > 0;

    return { hasViewport };
}

/**
 * Find contact page URLs
 */
function findContactUrls($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const contactUrls = new Set<string>();

    const contactKeywords = ['contact', 'get-quote', 'quote', 'estimate', 'consultation'];

    $('a[href]').each((_, element) => {
        const href = $(element).attr('href') || '';
        const text = $(element).text().toLowerCase();

        for (const keyword of contactKeywords) {
            if (href.toLowerCase().includes(keyword) || text.includes(keyword)) {
                try {
                    const url = new URL(href, baseUrl);
                    contactUrls.add(url.href);
                } catch (e) {
                    // Invalid URL, skip
                }
                break;
            }
        }
    });

    return Array.from(contactUrls);
}

/**
 * Detect CMS (focus on WordPress, but capture a best-effort string)
 */
function detectCMS($: cheerio.CheerioAPI, html: string): { is_wordpress: boolean; cms?: string } {
    let isWordPress = false;
    let cms: string | undefined;

    // Meta generator
    const generator = $('meta[name="generator"]').attr('content') || '';
    if (generator.toLowerCase().includes('wordpress')) {
        isWordPress = true;
        cms = 'wordpress';
    }

    // Asset paths
    if (html.includes('wp-content') || html.includes('wp-json') || html.includes('wp-emoji-release')) {
        isWordPress = true;
        cms = 'wordpress';
    }

    // Other CMS hints (best-effort)
    const bodyHtml = html.toLowerCase();
    if (!cms) {
        if (bodyHtml.includes('wixstatic.com') || bodyHtml.includes('wix.com')) cms = 'wix';
        else if (bodyHtml.includes('squarespace.com')) cms = 'squarespace';
        else if (bodyHtml.includes('webflow.io') || bodyHtml.includes('webflow.com')) cms = 'webflow';
        else if (bodyHtml.includes('weebly.com')) cms = 'weebly';
    }

    return { is_wordpress: isWordPress, cms };
}

/**
 * Detect basic ads/marketing/compliance signals from HTML (fast, read-only).
 * These do NOT impact "customer friction" directly, but they are strong indicators of Google Ads + tracking opportunity.
 */
function detectAdsSignals($: cheerio.CheerioAPI, html: string): {
    has_ga: boolean;
    has_gtm: boolean;
    has_google_ads_tag: boolean;
    has_meta_pixel: boolean;
    has_privacy_policy: boolean;
    has_terms: boolean;
} {
    const lower = html.toLowerCase();

    // Google Analytics / gtag
    const has_ga =
        lower.includes('google-analytics.com/analytics.js') ||
        lower.includes('google-analytics.com/g/collect') ||
        lower.includes('gtag(') && lower.includes('g-') ||
        lower.includes('ga(') && lower.includes('create');

    // Google Tag Manager
    const has_gtm =
        lower.includes('googletagmanager.com/gtm.js') ||
        /\bgtm-[a-z0-9]+\b/i.test(html);

    // Google Ads conversion tag / AW-
    const has_google_ads_tag =
        lower.includes('googleadservices.com') ||
        lower.includes('/pagead/conversion') ||
        /\baw-\d+\b/i.test(html);

    // Meta pixel (Facebook)
    const has_meta_pixel =
        lower.includes('connect.facebook.net') && lower.includes('fbevents.js') ||
        lower.includes('fbq(') && lower.includes('init');

    // Compliance links (best-effort)
    const has_privacy_policy =
        hasLinkMatching($, /(privacy|privacy-policy)/i) ||
        lower.includes('privacy policy');

    const has_terms =
        hasLinkMatching($, /(terms|terms-of-service|terms-and-conditions)/i) ||
        lower.includes('terms of service') ||
        lower.includes('terms and conditions');

    return { has_ga, has_gtm, has_google_ads_tag, has_meta_pixel, has_privacy_policy, has_terms };
}

function hasLinkMatching($: cheerio.CheerioAPI, re: RegExp): boolean {
    let found = false;
    $('a[href]').each((_, el) => {
        const href = ($(el).attr('href') || '').trim();
        const text = ($(el).text() || '').trim();
        if (re.test(href) || re.test(text)) {
            found = true;
        }
    });
    return found;
}

/**
 * Validate email address
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !email.includes('.png') && !email.includes('.jpg');
}


