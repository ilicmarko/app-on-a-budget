module.exports = {
    extends: "lighthouse:default",
    audits: ["weight-audit"],
    categories: {
        "bundle-size": {
            title: "Velicina JS datoteke",
            description: "Alooo bato, ajmo malo crossfit za sajt! Imamo kolegu s posla ako treba veza...",
            auditRefs: [{ id: "weight-audit", weight: 1 }]
        }
    }
};
