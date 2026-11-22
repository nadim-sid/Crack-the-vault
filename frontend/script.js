
//sample pass analysis 
const mockAnalysis = {
    basic: { score: 3, label: "Good" },
    smart: { score: 1, label: "Weak" },
    warnings: ["Common password pattern"],
    suggestions: ["Avoid predictable endings"]
};

//check password button
document.getElementById("checkButton").addEventListener("click", function () {
    const password = document.getElementById("password").value;

    if (password === "") {
        alert("Please enter a test password.");
        return;
    }

    document.getElementById("basicScore").textContent =
        `Basic Score: ${mockAnalysis.basic.score}/4 (${mockAnalysis.basic.label})`;

    document.getElementById("smartScore").textContent =
        `Smart Score: ${mockAnalysis.smart.score}/4 (${mockAnalysis.smart.label})`;

    document.getElementById("warnings").textContent =
        `Warnings: ${mockAnalysis.warnings.join(", ")}`;

    document.getElementById("suggestions").textContent =
        `Suggestions: ${mockAnalysis.suggestions.join(", ")}`;
});

//attack simulation button
document.getElementById("attackButton").addEventListener("click", function () {
    const password = document.getElementById("password").value;
    const strategy = document.getElementById("attackType").value;

    if (password === "") {
        alert("Please enter a test password.");
        return;
    }

    //sample response 
    const result = {
        strategy: strategy,
        found: true,
        attempts: 150,
        capped: false,
        explanation: "Sample simulation result"
    };

    document.getElementById("attackResults").textContent =
        `Attack: ${result.strategy} | ` +
        `Guessed: ${result.found ? "Yes" : "No"} | ` +
        `Attempts: ${result.attempts} | ` +
        `Limit reached: ${result.capped ? "Yes" : "No"} | ` +
        result.explanation;
});

//sample hashing benchmarks
const mockBenchmarks = {
    results: [
        {
            algorithm: "SHA-256",
            average_ms: 0.1,
            salt_used: false,
            notes: "Sample benchmark"
        },
        {
            algorithm: "Salted SHA-256",
            average_ms: 0.2,
            salt_used: true,
            notes: "Sample benchmark"
        },
        {
            algorithm: "Argon2id",
            average_ms: 100,
            salt_used: true,
            notes: "Sample benchmark"
        }
    ]
};

const hashTable = document.getElementById("hashResults");

mockBenchmarks.results.forEach(function (item) {
    const row = document.createElement("tr");

    const algorithm = document.createElement("td");
    algorithm.textContent = item.algorithm;

    const time = document.createElement("td");
    time.textContent = item.average_ms;

    const salt = document.createElement("td");
    salt.textContent = item.salt_used ? "Yes" : "No";

    row.appendChild(algorithm);
    row.appendChild(time);
    row.appendChild(salt);

    hashTable.appendChild(row);
});
