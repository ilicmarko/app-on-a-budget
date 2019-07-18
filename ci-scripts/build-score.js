#!/usr/local/bin/node

/**
 This script will compare and report back the results to the pr.
 **/

const fs = require('fs');
const path = require('path');

const bot = require('circle-github-bot').create();
const budget = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { lighthouse, bundleSize } = budget;

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
let circleStdOut = '';

// Lets compare and calculate the score
const lighthouseScores = reports.json.reduce((acc, report) => {
    Object.keys(lighthouse).forEach(category => {
        acc[category] = acc[category] || [];
        acc[category].push(report.categories[category].score * 100); // Score in lighthouse is between 0 and 1.
    });
    return acc;
}, {});

circleStdOut += `
------------------------------------------
Number of parallel test runs: ${reports.json.length}
------------------------------------------
`;

comment.push(
    `<h2>Lighthouse report</h2>`,
    `<p>Best scores across <strong>${reports.json.length}</strong> runs:</p>`,
    `<p>`,
);

Object.keys(lighthouse).forEach(category => {
   const budgetScore = lighthouse[category];
   const testScore = Math.max(...lighthouseScores[category]);

    if (testScore < budgetScore[category]) {
        circleStdOut.push(`❌ ${category}: ${testScore}/${budgetScore}`);
        comment.push(
            `<strong>❌ ${category}:</strong> ${testScore}/${budgetScore}<br />`
        );
    } else {
        circleStdOut.push(`✅ ${category}: ${testScore}/${budgetScore}`);
        comment.push(
            `<strong>✅ ${category}:</strong> ${testScore}/${budgetScore}<br />`
        );
    }
});

comment.push(`</p>`);

// Add a link to the report

const reportLinks = reports.html.map((filename, id) =>
    bot.artifactLink(`reports/${filename}`, `run ${id + 1}`).replace('/home/circleci/project', '')
);

comment.push(`<hr /><p><strong>Detailed reports:</strong> ${reportLinks.join(', ')}</p>`);

console.log(circleStdOut.join(`\n`));

try {
    bot.comment(comment.join(`\n`));
} catch (e) {
    console.error(e);
}





