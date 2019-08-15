// Zato sto `npm link` je pravio problem morao da navedem celu putanju
const Audit = require("/usr/local/lib/node_modules/lighthouse").Audit;

class WeightAudit extends Audit {
    static get meta() {
        return {
            id: "weight-audit",
            title: "Velicina JS datoteke",
            failureTitle: `JS bundle exceeds your threshold of ${
                process.env.MAX_BUNDLE_SIZE_KB
            }kb`,
            description: "Alooo bato, ajmo malo crossfit za sajt!",
            // Sakpuljac (Getherer)
            requiredArtifacts: ["devtoolsLogs"]
        };
    }

    static async audit(artifacts, context) {
        // Uzmi Devtools log
        const devtoolsLogs = artifacts.devtoolsLogs["defaultPass"];
        // Uzmi network tab
        const networkRecords = await artifacts.requestNetworkRecords(devtoolsLogs);

        // Nadji sve resurse koji su tipa `Script` i podudaraju se sa nasim imenom
        const bundleRecord = networkRecords.find(record =>
                record.resourceType === "Script"
            &&  new RegExp(process.env.BUNDLE_NAME).test(record.url)
        );

        // Proveri da li je test prosao
        const belowThreshold =  bundleRecord.transferSize <= process.env.BUNDLE_SIZE * 1024;

        return {
            rawValue: (bundleRecord.transferSize / 1024).toFixed(1),
            // Rezultat se vraca izmedju 0 i 1, posto kod nas to moze da bude samo true (1) ili false (0)
            // Prebacicu rezultat iz Boolean u Number.
            score: Number(belowThreshold),
            displayValue: `${bundleRecord.url} je ${(bundleRecord.transferSize / 1024).toFixed(1)}kb`
        };
    }
}

module.exports = WeightAudit;
