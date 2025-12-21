import { Business, ScoringFactors, HeuristicResult } from './types';

/**
 * Calculate friction score based on the spec:
 * - +25 if no "Book now" or "Schedule" link detected
 * - +20 if contact form has > 6 inputs OR > 3 required fields
 * - +10 if no phone as tel: link
 * - +10 if no email found
 * - +10 if no chat widget
 * - +10 if no file upload available
 * - +5 if no meta viewport OR HTML > 1.2 MB
 * - -20 if online booking detected
 * - -10 if chat widget detected
 * - Cap at 100, floor at 0
 */
export function calculateFrictionScore(heuristics: HeuristicResult): {
    score: number;
    factors: ScoringFactors;
    notes: string[];
} {
    let score = 0;
    const notes: string[] = [];

    // Positive friction factors (make it harder for customers)
    const no_booking = !heuristics.has_booking;
    if (no_booking) {
        score += 25;
        notes.push('no_booking');
    }

    const long_form = heuristics.form_inputs > 6 || heuristics.form_required > 3;
    if (long_form) {
        score += 20;
        notes.push(`form_${heuristics.form_inputs}_inputs`);
        if (heuristics.form_required > 3) {
            notes.push(`${heuristics.form_required}_required_fields`);
        }
    }

    const no_phone_link = heuristics.phones.length === 0;
    if (no_phone_link) {
        score += 10;
        notes.push('no_phone_link');
    }

    const no_email = heuristics.emails.length === 0;
    if (no_email) {
        score += 10;
        notes.push('no_email');
    }

    const no_chat = !heuristics.has_chat;
    if (no_chat) {
        score += 10;
        notes.push('no_chat');
    }

    // No instant quote / estimator present
    const no_instant_quote = !heuristics.has_instant_quote;
    if (no_instant_quote) {
        score += 25;
        notes.push('no_instant_quote');
    }

    const no_file_upload = !heuristics.has_file_upload;
    if (no_file_upload) {
        score += 10;
        notes.push('no_file_upload');
    }

    const poor_mobile = !heuristics.mobile_meta_viewport || heuristics.html_size_bytes > 1.2 * 1024 * 1024;
    if (poor_mobile) {
        score += 5;
        if (!heuristics.mobile_meta_viewport) {
            notes.push('no_meta_viewport');
        }
        if (heuristics.html_size_bytes > 1.2 * 1024 * 1024) {
            notes.push(`html_${Math.round(heuristics.html_size_bytes / 1024)}kb`);
        }
    }

    // Negative friction factors (make it easier for customers)
    const has_online_booking = heuristics.has_booking;
    if (has_online_booking) {
        score -= 20;
        notes.push(`booking_${heuristics.booking_services.join('_')}`);
    }

    const has_chat_widget = heuristics.has_chat;
    if (has_chat_widget) {
        score -= 10;
        notes.push(`chat_${heuristics.chat_services.join('_')}`);
    }

    // Instant quote widget detected reduces friction significantly
    const has_instant_quote_widget = heuristics.has_instant_quote;
    if (has_instant_quote_widget) {
        score -= 20;
        if (heuristics.instant_quote_services && heuristics.instant_quote_services.length > 0) {
            notes.push(`instant_${heuristics.instant_quote_services.join('_')}`);
        } else {
            notes.push('instant_quote');
        }
    }

    // Cap between 0 and 100
    score = Math.max(0, Math.min(100, score));

    const factors: ScoringFactors = {
        no_booking,
        long_form,
        no_chat,
        no_phone_link,
        no_email,
        no_file_upload,
        poor_mobile,
        has_online_booking,
        has_chat_widget,
        no_instant_quote,
        has_instant_quote_widget
    };

    return { score, factors, notes };
}

export function getScoreBand(score: number): 'A' | 'B' | 'C' | 'D' {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
}

export function shouldIncludeBusiness(business: Business): boolean {
    // Filter out businesses with no contact method unless phone present
    const hasContactMethod = business.email_primary ||
        business.contact_url ||
        business.phone;

    return Boolean(hasContactMethod);
}

export function rankBusinesses(businesses: Business[]): Business[] {
    // Sort by friction_score DESC, then by niche priority
    const nichePriority = {
        'roofing': 1,
        'hvac': 2,
        'remodeling': 3,
        'landscaping': 4,
        'tree': 5,
        'pest': 6
    };

    return businesses
        .filter(shouldIncludeBusiness)
        .sort((a, b) => {
            // Primary sort: friction score (higher is better for targeting)
            if (a.friction_score !== b.friction_score) {
                return b.friction_score - a.friction_score;
            }

            // Secondary sort: niche priority
            const aPriority = nichePriority[a.niche as keyof typeof nichePriority] || 999;
            const bPriority = nichePriority[b.niche as keyof typeof nichePriority] || 999;

            return aPriority - bPriority;
        });
}

export function getTargetingTier(business: Business): 'PRIORITY' | 'GOOD' | 'PASS' | 'SKIP' {
    if (business.score_band === 'A') return 'PRIORITY';
    if (business.score_band === 'B') return 'GOOD';
    if (business.score_band === 'C') return 'PASS';
    return 'SKIP';
}
