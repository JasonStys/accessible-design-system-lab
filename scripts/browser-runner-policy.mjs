/**
 * File: browser-runner-policy.mjs
 * Purpose: Guard the reviewed two-job CI setup recipe without changing application/browser acceptance.
 * Symbols and line locations: see docs/code-index.md.
 * State: literal workflow regression contract, not a general YAML parser or untrusted-source permission boundary.
 */
export const officialMirrorStep =
  '      - name: Bound official Ubuntu mirror access on the disposable runner\n        timeout-minutes: 1\n        shell: bash\n        run: |\n          test "$GITHUB_ACTIONS" = "true"\n          test "$RUNNER_OS" = "Linux"\n          test "$(uname -m)" = "x86_64"\n          . /etc/os-release\n          test "$ID" = "ubuntu"\n          test "$VERSION_ID" = "24.04"\n          test -f /etc/apt/apt-mirrors.txt\n          test -f /usr/share/keyrings/ubuntu-archive-keyring.gpg\n          grep -Eq \'^URIs:[[:space:]]+mirror[+]file:/etc/apt/apt-mirrors[.]txt[[:space:]]*$\' /etc/apt/sources.list.d/ubuntu.sources\n          grep -Eq \'^Signed-By:[[:space:]]+/usr/share/keyrings/ubuntu-archive-keyring[.]gpg[[:space:]]*$\' /etc/apt/sources.list.d/ubuntu.sources\n          # Preserve source suites, components and signature checks; avoid the stalled HTTP Azure mirror.\n          printf \'https://archive.ubuntu.com/ubuntu/\\tpriority:1\\nhttps://security.ubuntu.com/ubuntu/\\tpriority:2\\n\' |\n            sudo tee /etc/apt/apt-mirrors.txt >/dev/null\n          # APT reads this leaf after the runner defaults; these are acquire, not APT::Acquire, keys.\n          printf \'%s\\n\' \'Acquire::Retries "1";\' \'Acquire::http::Timeout "15";\' \'Acquire::https::Timeout "15";\' |\n            sudo tee /etc/apt/apt.conf.d/zzzz-portfolio-network >/dev/null\n          apt_network_config="$(apt-config dump Acquire::Retries Acquire::http::Timeout Acquire::https::Timeout)"\n          printf \'%s\\n\' "$apt_network_config"\n          grep -Fx \'Acquire::Retries "1";\' <<< "$apt_network_config"\n          grep -Fx \'Acquire::http::Timeout "15";\' <<< "$apt_network_config"\n          grep -Fx \'Acquire::https::Timeout "15";\' <<< "$apt_network_config"\n';

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
/** Preserve signed official sources, finite effective APT settings and every existing real acceptance command. */
export function validateBrowserSetup(source) {
  for (const name of ["package", "browser"]) {
    const text = job(source, name);
    if (
      (text.match(/^ {4}runs-on:/gm) ?? []).length !== 1 ||
      !text.includes("    runs-on: ubuntu-24.04\n    timeout-minutes: 20\n") ||
      !text.includes(officialMirrorStep) ||
      !text.includes(
        "      - name: Install operating-system browser dependencies\n        timeout-minutes: 10\n        run: npx playwright install-deps chromium\n",
      ) ||
      !text.includes(
        "      - name: Install the exact locked Chromium browser\n        timeout-minutes: 5\n        run: npx playwright install chromium\n",
      ) ||
      /continue-on-error|allow-unauthenticated|trusted=yes|--no-sandbox|--with-deps|\|\| true/.test(
        text,
      )
    )
      throw new Error("Reviewed signed browser setup recipe changed.");
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
    const acceptance = text.indexOf(
      `        run: ${name === "package" ? "npm run package:smoke" : "npm run test:e2e"}`,
    );
    if (acceptance <= install)
      throw new Error("Browser acceptance must follow actual setup.");
  }
}
