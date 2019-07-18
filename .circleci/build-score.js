#!/usr/local/bin/node

/**
 This script will compare and report back the results to the pr.
 **/

const fs = require('fs');
const path = require('path');

const bot = require('circle-github-bot').create();
const budget = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { lighthouse, bundleSize } = budget;

function showOrSkipScore(score) {
    return (score && score > 0) ? score : `<em>No threshold</em>`
}

function generateReport({newScore, requiredScore, report}) {
    return `
<h2>Lighthouse report</h2>
<p><a href="https://developers.google.com/web/tools/lighthouse/" rel="nofollow">Lighthouse</a> has been ran report for the changes in this PR:</p>
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Score</th>
      <th>Required score</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Performance</td>
      <td>${newScore.performance}</td>
      <td>${showOrSkipScore(requiredScore.performance)}</td>
    </tr>
    <tr>
      <td>Progressive Web App</td>
      <td>${newScore.pwa}</td>
      <td>${showOrSkipScore(requiredScore.pwa)}</td>
    </tr>
    <tr>
      <td>Accessibility</td>
      <td>${newScore.accessibility}</td>
      <td>${showOrSkipScore(requiredScore.accessibility)}</td>
    </tr>
    <tr>
      <td>Best Practices</td>
      <td>${newScore['best-practices']}</td>
      <td>${showOrSkipScore(requiredScore['best-practices'])}</td>
    </tr>
    <tr>
      <td>SEO</td>
      <td>${newScore.seo}</td>
      <td>${showOrSkipScore(requiredScore.seo)}</td>
    </tr>
  </tbody>
</table>
<h2>More information:</h2>
<table>
  <tbody>
    <tr>
      <th>${report['first-meaningful-paint'].title}</th>
      <td>${report['first-meaningful-paint'].displayValue}</td>
    </tr>
    <tr>
      <th>${report['first-contentful-paint'].title}</th>
      <td>${report['first-contentful-paint'].displayValue}</td>
    </tr>
    <tr>
      <th>${report['time-to-first-byte'].title}</th>
      <td>${report['time-to-first-byte'].displayValue}</td>
    </tr>
    <tr>
      <th>${report['speed-index'].title}</th>
      <td>${report['speed-index'].displayValue}</td>
    </tr>
  </tbody>
</table>
<p><em>Tested with Lighthouse version: ${report.lighthouseVersion}</em></p>`
}

// read all reports
const reportsFolder = process.argv[3];
const reports = {
    json: [],
    html: [],
};

fs.readdirSync(reportsFolder).forEach(file => {
    switch (path.extname(file)) {
        case '.json':
            reports.json.push(JSON.parse(fs.readFileSync(path.join(reportsFolder, file), 'utf8')));
            break;
        case '.html':
            reports.html.push(file);
            break;
    }
});

let comment = [];
let circleStdOut = [];
let failed = false;

// Lets compare and calculate the score
const lighthouseScores = reports.json.reduce((acc, report) => {
    Object.keys(lighthouse).forEach(category => {
        acc[category] = acc[category] || [];
        acc[category].push(report.categories[category].score * 100); // Score in lighthouse is between 0 and 1.
    });
    return acc;
}, {});


circleStdOut.push(
    `------------------------------------------`,
    `Number of parallel test runs: ${reports.json.length}`,
    `------------------------------------------`
);
let data = {
    newScore: {},
    requiredScore: {},
    report: {}
};
Object.keys(lighthouse).forEach(category => {
   const budgetScore = lighthouse[category];
   const testScore = Math.max(...lighthouseScores[category]);

   data.newScore[category] = testScore;
   data.requiredScore[category] = budgetScore;

    if (testScore < budgetScore) {
        circleStdOut.push(`❌ ${category}: ${testScore}/${budgetScore}`);
        failed = true || failed;
    } else {
        circleStdOut.push(`✅ ${category}: ${testScore}/${budgetScore}`);
    }
});
const additionalAudits = [
    'first-meaningful-paint',
    'first-contentful-paint',
    'time-to-first-byte',
    'speed-index',
];
const additionalAuditsMetrics = {};

function msToHuman(ms) {
    return ms < 1000 ? `${Math.round(ms).toString()} ms` : `${(ms/1000).toFixed(1).toString()} s`;
}

additionalAudits.forEach(key => {
    let audit = { numericValue: 17072907 };
    reports.json.forEach(report => {
        audit.title = report.audits[key].title;
        audit.numericValue = Math.min(audit.numericValue, report.audits[key].numericValue);
        audit.displayValue = msToHuman(audit.numericValue);
        console.log(report.audits[key]);
    });
    console.log(report.audits[key].numericValue);
    console.log(audit);
    additionalAuditsMetrics[key] = audit;
});

additionalAuditsMetrics.lighthouseVersion = reports.json[0].lighthouseVersion;
data.report = additionalAuditsMetrics;

comment.push(generateReport(data));

// Add a link to the report
const reportLinks = reports.html.map((filename, i) => {
    return bot.artifactLink(`reports/${filename}`, `Report ${i + 1}`).replace('/home/circleci/project', '');
});

comment.push(`<hr /><p><strong>Detailed reports:</strong> ${reportLinks.join(', ')}</p>`);

console.log(circleStdOut.join('\n'));

try {
    bot.comment(process.env.GH_AUTH_TOKEN, comment.join('\n'));
} catch (e) {
    console.error(e);
}
if (failed) {
    process.exit(1);
}
