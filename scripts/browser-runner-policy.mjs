/**
 * File: browser-runner-policy.mjs
 * Purpose: Guard the reviewed two-job CI setup recipe without changing application/browser acceptance.
 * Symbols and line locations: see docs/code-index.md.
 * State: literal workflow regression contract, not a general YAML parser or untrusted-source permission boundary.
 */
/** Read an exactly named literal job; duplicate declarations are deliberately refused. */
function job(source, name) {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const starts = lines.flatMap((line, index) =>
    line === `  ${name}:` ? [index] : [],
  );
  if (starts.length !== 1)
    throw new Error("Expected one reviewed browser job.");
  const start = starts[0];
  const next = lines.findIndex(
    (line, index) => index > start && /^ {2}[a-z][a-z0-9-]*:$/.test(line),
  );
  return lines.slice(start, next < 0 ? lines.length : next).join("\n");
}
/** Preserve actual locked-browser/host proof and every original downstream acceptance command. */
export function validateBrowserSetup(source) {
  for (const name of ["package", "browser"]) {
    const text = job(source, name);
    if (
      (text.match(/^ {4}runs-on:/gm) ?? []).length !== 1 ||
      !text.includes("    runs-on: ubuntu-24.04\n    timeout-minutes: 20\n") ||
      !text.includes(
        "      PLAYWRIGHT_BROWSERS_PATH: ${{ github.workspace }}/.runtime/ci-playwright\n",
      ) ||
      !text.includes(
        "      - name: Install the exact locked Chromium browser\n        timeout-minutes: 5\n        run: npx playwright install chromium\n",
      ) ||
      !text.includes(
        "      - name: Prove actual browser library closure and font/layout behavior\n        timeout-minutes: 2\n        run: node scripts/browser-host-proof.mjs\n",
      ) ||
      /continue-on-error|SKIP_VALIDATE_HOST_REQUIREMENTS|allow-unauthenticated|trusted=yes|--no-sandbox|--with-deps|install-deps|sudo|\|\| true/.test(
        text,
      )
    )
      throw new Error("Reviewed real browser host-proof recipe changed.");
    const commands =
      name === "package"
        ? [
            "npm run build",
            "npm run bundle:check",
            "npm run package:smoke",
            "npm run build:storybook",
            "npm audit --audit-level=moderate",
          ]
        : ["npm run test:e2e"];
    for (const command of commands)
      if (!text.includes(`        run: ${command}\n`))
        throw new Error(
          "Original browser/package acceptance command is missing.",
        );
    const install = text.indexOf(
      "        run: npx playwright install chromium",
    );
    const proof = text.indexOf(
      "        run: node scripts/browser-host-proof.mjs",
    );
    const acceptance = text.indexOf(
      `        run: ${name === "package" ? "npm run package:smoke" : "npm run test:e2e"}`,
    );
    if (proof <= install || acceptance <= proof)
      throw new Error("Actual host proof must precede browser acceptance.");
  }
}
