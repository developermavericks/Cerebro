const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const axios = require('axios');
const cheerio = require('cheerio');
const ReachEstimator = require('./ReachEstimator');

const puppeteerExtra = puppeteer.default || puppeteer;
puppeteerExtra.use(StealthPlugin());

class SmartScraper {
    // Random delay between 2-5 seconds
    async delay(min = 2000, max = 5000) {
        const time = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // Get random user agent
    getRandomUserAgent() {
        const userAgent = new UserAgent({ deviceCategory: 'desktop' });
        return userAgent.toString();
    }

    async scrapeDirectPageAxios(url) {
        try {
            console.log(`[SmartScraper] Attempting fast HTTP fetch for ${url}`);
            const response = await axios.get(url, {
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.status === 200 && response.data) {
                const $ = cheerio.load(response.data);
                const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content')?.trim();
                const description = $('meta[name="description"]').attr('content')?.trim() || $('meta[property="og:description"]').attr('content')?.trim();
                
                // Get a meaningful snippet
                let snippet = '';
                const article = $('article, .article-content, .post-content, .article-body, #article-body, .entry-content');
                if (article.length > 0) {
                    snippet = article.text().trim().slice(0, 1000).replace(/\s+/g, ' ');
                } else {
                    // Fallback to paragraph texts
                    const paragraphs = [];
                    $('p').slice(0, 10).each((i, el) => {
                        paragraphs.push($(el).text().trim());
                    });
                    snippet = paragraphs.filter(p => p.length > 20).join(' ').slice(0, 1000).replace(/\s+/g, ' ');
                }

                if (title) {
                    console.log(`[SmartScraper] Fast HTTP fetch successful for ${url}`);
                    return {
                        title,
                        description,
                        snippet: snippet || description || ''
                    };
                }
            }
        } catch (e) {
            console.warn(`[SmartScraper] Fast HTTP fetch failed or blocked: ${e.message}`);
        }
        return null;
    }

    async scrapeUrl(url, title = '') {
        let browser;
        let isFrontPage = false;

        // Extract a robust fallback title from URL path if not provided
        let fallbackTitle = '';
        try {
            if (url) {
                const parsed = new URL(url);
                const segments = parsed.pathname.split('/').filter(Boolean);
                let slug = '';
                for (const segment of segments) {
                    const cleanSeg = segment.replace(/\.[a-zA-Z0-9]+$/, '');
                    if (cleanSeg.includes('-') || cleanSeg.includes('_')) {
                        if (cleanSeg.length > slug.length) {
                            slug = cleanSeg;
                        }
                    }
                }
                if (!slug && segments.length > 0) {
                    slug = segments[segments.length - 1].replace(/\.[a-zA-Z0-9]+$/, '');
                }
                if (slug) {
                    fallbackTitle = slug.replace(/[-_]/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
                }
            }
        } catch (e) {
            console.warn(`[SmartScraper] Error parsing URL fallback title: ${e.message}`);
        }

        if (!title && fallbackTitle) {
            title = fallbackTitle;
            console.log(`[SmartScraper] Initialized fallback title from URL: "${title}"`);
        }

        // Perform homepage check early
        try {
            if (url) {
                const parsedUrl = new URL(url);
                const origin = parsedUrl.origin;
                const pathname = parsedUrl.pathname;

                if (pathname && pathname.length > 3 && pathname !== '/') {
                    console.log(`[SmartScraper] Running homepage check against origin: ${origin} for path: ${pathname}`);
                    const homepageRes = await axios.get(origin, {
                        timeout: 8000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                        }
                    });

                    if (homepageRes.status === 200 && homepageRes.data) {
                        const html = homepageRes.data;
                        const cleanPath = pathname.trim();
                        const cleanPathNoSlash = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;

                        if (html.includes(url) || html.includes(cleanPath) || (cleanPathNoSlash && html.includes(cleanPathNoSlash))) {
                            isFrontPage = true;
                            console.log(`[SmartScraper] Homepage check MATCHED! Article is on front page.`);
                        } else {
                            console.log(`[SmartScraper] Homepage check: no match found on homepage.`);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn(`[SmartScraper] Homepage check failed or timed out: ${err.message}`);
        }

        try {
            console.log(`[SmartScraper] Launching stealth browser for ${url}`);
            browser = await puppeteerExtra.launch({
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--single-process',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080'
                ]
            });

            const page = await browser.newPage();

            // Intelligent request interception: block ads, images, media, and scripts for direct targets
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                const reqUrl = req.url().toLowerCase();
                
                const adKeywords = [
                    'doubleclick', 'google-analytics', 'adservice', 'adsystem', 
                    'adnxs', 'taboola', 'outbrain', 'hotjar', 'facebook', 'amazon-adsystem'
                ];
                
                const isAd = adKeywords.some(keyword => reqUrl.includes(keyword));

                if (isAd || ['image', 'font', 'stylesheet', 'media'].includes(resourceType)) {
                    req.abort();
                } else if (resourceType === 'script') {
                    // Only allow scripts for Google Searches, block on targets to avoid timeouts/detaches
                    if (reqUrl.includes('google.com/search') || reqUrl.includes('google.co.')) {
                        req.continue();
                    } else {
                        req.abort();
                    }
                } else {
                    req.continue();
                }
            });

            const ua = this.getRandomUserAgent();
            await page.setUserAgent(ua);
            await page.setViewport({ width: 1920, height: 1080 });

            // --- PHASE 1: Google Search for URL ---
            const result1 = await this.searchGoogle(page, `"${url}"`);

            if (result1 && result1.count > 0) {
                const meta = await this.scrapeDirectPage(page, url);
                const social = await this.scrapeSocialMentions(url, page);
                
                await browser.close();
                return {
                    title: meta.title || title || '',
                    url,
                    totalMentions: result1.count,
                    domains: result1.domains,
                    prominenceScore: result1.avgRankScore,
                    source: 'Direct',
                    status: 'Success',
                    metaDescription: meta.description,
                    snippet: meta.snippet,
                    isFrontPage,
                    socialProof: {
                        ...social,
                        reddit: result1.domains.filter(d => d.includes('reddit.com')).length
                    },
                    temporalLog: result1.dates
                };
            }

            await this.delay();

            // Attempt 2: Title Search
            if (title) {
                const part1 = title.split(' - ')[0] || '';
                const cleanTitle = (part1.split(' | ')[0] || '').trim();
                const hostname = new URL(url).hostname;
                const query = `"${cleanTitle}" -site:${hostname}`;

                const result2 = await this.searchGoogle(page, query);
                if (result2) {
                    await browser.close();
                    return {
                        title,
                        url,
                        totalMentions: result2.count,
                        domains: result2.domains,
                        prominenceScore: result2.avgRankScore,
                        source: 'Title',
                        status: 'Success',
                        isFrontPage
                    };
                }
            }

            await browser.close();
            throw new Error("All scraping attempts failed");

        } catch (error) {
            console.error(`[SmartScraper] Blocked or Failed: ${error}`);
            if (browser) await browser.close();

            console.log(`[SmartScraper] Switching to ReachEstimator`);
            const estimate = ReachEstimator.estimate(url, title || '', 'v9', { isFrontPage });
            return {
                title: title || '',
                url,
                totalMentions: estimate.mentions,
                domains: [],
                prominenceScore: 0,
                source: 'Estimator',
                status: 'Fallback',
                isFrontPage
            };
        }
    }

    async searchGoogle(page, query) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

            if (await page.$('#captcha-form') || await page.$('iframe[src*="google.com/recaptcha"]')) {
                console.warn("[SmartScraper] CAPTCHA detected!");
                return null;
            }

            const matches = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('.g a'));
                return anchors.map((a, index) => {
                    try {
                        return {
                            host: new URL(a.href).hostname,
                            rank: index + 1
                        };
                    } catch { return null; }
                })
                    .filter(item => item && item.host && !item.host.includes('google') && !item.host.includes('youtube'))
                    .slice(0, 5);
            });

            let totalScore = 0;
            const uniqueDomains = [];

            matches.forEach(m => {
                if (!uniqueDomains.includes(m.host)) {
                    uniqueDomains.push(m.host);
                    if (m.rank === 1) totalScore += 2.0;
                    else if (m.rank <= 3) totalScore += 1.0;
                    else totalScore += 0.5;
                }
            });

            const avgRankScore = uniqueDomains.length > 0 ? totalScore / uniqueDomains.length : 1;

            const statsHandle = await page.$('#result-stats');
            if (statsHandle) {
                const text = await page.evaluate((el) => el.innerText, statsHandle);
                const match = text.match(/([\d,]+)/);
                if (match) {
                    const count = parseInt(match[1].replace(/,/g, ''), 10);
                    const dates = await page.evaluate(() => {
                        const dateSpans = Array.from(document.querySelectorAll('.f, .LE0U9e, .MU91fe'));
                        return dateSpans.map(s => s.innerText.trim()).filter(t => t.length > 0);
                    });
                    return { count, domains: uniqueDomains, avgRankScore, dates };
                }
            }

            const results = await page.$$('.g');
            if (results.length > 0) return { count: results.length, domains: uniqueDomains, avgRankScore, dates: [] };

            return { count: 0, domains: [], avgRankScore: 0, dates: [] };
        } catch (e) {
            console.warn(`[SmartScraper] Search failed for ${query}: ${e}`);
            return null;
        }
    }

    async scrapeSocialMentions(url, page) {
        const platforms = [
            { name: 'x', query: `site:x.com OR site:twitter.com "${url}"` },
            { name: 'linkedin', query: `site:linkedin.com "${url}"` },
            { name: 'facebook', query: `site:facebook.com "${url}"` }
        ];

        const results = { x: 0, linkedin: 0, facebook: 0 };

        for (const p of platforms) {
            console.log(`[SmartScraper] Dorking ${p.name}: ${p.query}`);
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(p.query)}`;
            try {
                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
                const statsHandle = await page.$('#result-stats');
                if (statsHandle) {
                    const text = await page.evaluate((el) => el.innerText, statsHandle);
                    const match = text.match(/([\d,]+)/);
                    if (match) {
                        results[p.name] = parseInt(match[1].replace(/,/g, ''), 10);
                    }
                }
                await this.delay(1000, 2000);
            } catch (e) {
                console.warn(`[SmartScraper] Social dork for ${p.name} failed: ${e}`);
            }
        }

        return results;
    }

    async scrapeDirectPage(page, url) {
        // Try fast HTTP Axios + Cheerio first
        const fastResult = await this.scrapeDirectPageAxios(url);
        if (fastResult) {
            return fastResult;
        }

        try {
            console.log(`[SmartScraper] Visiting direct page via Puppeteer: ${url}`);
            
            // Try to load with a lower timeout (15s) and catch frame detaches/timeouts
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            } catch (gotoError) {
                console.warn(`[SmartScraper] Navigation warning/timeout (continuing anyway): ${gotoError.message}`);
                // Allow a tiny delay for any pending DOM writes
                await this.delay(1500, 1500);
            }
            
            const meta = await page.evaluate(() => {
                const getMeta = (name) => {
                    const el = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"]`);
                    return el ? el.content : undefined;
                };

                const getSnippet = () => {
                    const article = document.querySelector('article, .article-content, .post-content, .article-body, #article-body, .entry-content');
                    if (article) return article.textContent?.trim().slice(0, 1000);
                    
                    const paragraphs = Array.from(document.querySelectorAll('p')).slice(0, 10);
                    const pText = paragraphs.map(p => p.textContent?.trim() || '').filter(t => t.length > 20).join(' ');
                    if (pText.length > 0) return pText.slice(0, 1000).replace(/\s+/g, ' ');

                    return document.body.textContent?.trim().slice(0, 1000).replace(/\s+/g, ' ');
                };

                return {
                    title: document.title,
                    description: getMeta('description'),
                    snippet: getSnippet()
                };
            });

            return meta;
        } catch (e) {
            console.warn(`[SmartScraper] Direct page Puppeteer scrape failed: ${e}`);
            return {};
        }
    }
}

module.exports = SmartScraper;
