const Audit = require("/usr/local/lib/node_modules/lighthouse").Audit;

class AuthAudit extends Audit {
    static get meta() {
        return {
            id: 'auth-audit',
            title: 'Authenticate',
            failureTitle: 'Please login or fill in the ENV vars',
            description: 'Secret page behind a locked bookcase.',
            requiredArtifacts: ['Auth']
        }
    }
    static async audit(artifacts, context) {
        return {
            rawValue: 400,
            score: 100,
            displayValue: 'Ok',
        }
    }
}

module.exports = AuthAudit;
