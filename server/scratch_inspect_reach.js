const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const ReachEstimator = require('./reach_lens/ReachEstimator');
const SiteRank = require('./reach_lens/SiteRankService');

async function testReach() {
    console.log('--- Initializing SiteRank ---');
    await SiteRank.initRankings();

    const testCases = [
        { url: 'https://techcrunch.com/2026/06/08/awesome-ai', title: 'AI breakthrough sweeps the industry', version: 'v9', meta: { socialProof: { x: 50, reddit: 20 } } },
        { url: 'https://google.com/search-engine-update', title: 'Google updates Search algorithm with AI Overviews', version: 'v9', meta: { socialProof: { x: 100 } } },
        { url: 'https://non-existent-domain-12345.xyz/article-path', title: 'A minor local update occurs', version: 'v5', meta: null },
        { url: null, title: null, version: 'v9', meta: null }, // testing crash robustness
        { url: 'invalid-url-string', title: '', version: 'v2', meta: {} }, // testing invalid URL formatting
        
        // Times of India (TOI) Premier domain test cases
        { url: 'https://timesofindia.indiatimes.com/sports/cricket/some-story', title: 'India wins cricket match', version: 'v9', meta: { totalMentions: 1 } },
        { url: 'https://timesofindia.indiatimes.com/sports/cricket/some-story', title: 'India wins cricket match', version: 'v9', meta: { totalMentions: 1, isFrontPage: true } },
        { url: 'https://timesofindia.indiatimes.com/sports/cricket/some-story', title: 'India wins cricket match', version: 'v9', meta: { totalMentions: 100 } },
        { url: 'https://timesofindia.indiatimes.com/sports/cricket/some-story', title: 'India wins cricket match', version: 'v9', meta: { totalMentions: 10000 } }
    ];

    console.log('\n--- Running Test Cases ---');
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        console.log(`\nTest Case ${i + 1}:`);
        console.log(`  URL: ${tc.url}`);
        console.log(`  Title: ${tc.title}`);
        console.log(`  Version: ${tc.version}`);

        try {
            // First check dynamic weight calculation
            let weight = 1.0;
            if (tc.url) {
                let hostname = tc.url;
                try {
                    hostname = new URL(tc.url).hostname;
                } catch(e) {}
                weight = await ReachEstimator.getDomainWeight(hostname);
                console.log(`  Resolved Domain Weight: ${weight}`);
            }

            const res = ReachEstimator.estimate(tc.url, tc.title, tc.version, {
                ...tc.meta,
                domainWeight: weight,
                url: tc.url
            });

            console.log(`  Estimation Successful:`);
            console.log(`    Reach: ${res.reach || res.finalReach}`);
            console.log(`    Sentiment Score: ${res.sentimentScore}`);
            console.log(`    Confidence: ${res.confidence || 100}%`);
            if (res.uv) console.log(`    UV: ${res.uv}`);
            if (res.upv) console.log(`    UPV: ${res.upv}`);
        } catch (err) {
            console.error(`  Estimation Failed with Error:`, err);
        }
    }

    console.log('\nVerification completed.');
}

testReach();
