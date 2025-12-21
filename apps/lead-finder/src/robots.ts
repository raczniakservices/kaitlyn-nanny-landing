import { parse as parseRobots } from 'robots-txt-parse';

/**
 * Check if a URL is allowed by robots.txt
 */
export async function checkRobotsTxt(domain: string, path: string, userAgent: string): Promise<boolean> {
    try {
        const robotsUrl = `https://${domain}/robots.txt`;
        const response = await fetch(robotsUrl, {
            headers: {
                'User-Agent': userAgent
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
            // If robots.txt doesn't exist or is inaccessible, assume allowed
            return true;
        }

        const robotsText = await response.text();
        const robots = parseRobots(robotsText);

        // Check if the path is allowed for our user agent
        return robots.isAllowed(userAgent, path);
    } catch (error) {
        // If there's any error fetching or parsing robots.txt, assume allowed
        console.warn(`Warning: Could not check robots.txt for ${domain}:`, error);
        return true;
    }
}


