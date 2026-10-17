import { amdLite } from "amd-lite";

const originalDefine = amdLite.define;

/**
 * Set of already defined modules. Used for deduplication.
 */
const definedModules = new Set<string>();

/**
 * Throttle timer to make sure only one attempt at loading modules will run for a batch of loaded scripts.
 */
let throttledAutoRunTimer: NodeJS.Timeout | number | undefined;

/**
 * Schedule the automatic resolving of all waiting modules on the next available frame.
 */
function scheduleModulesAutoRun() {
  clearTimeout(throttledAutoRunTimer);

  throttledAutoRunTimer = setTimeout(() => {
    amdLite.resolveDependencies(Object.keys(amdLite.waitingModules));
  });
}

amdLite.define = (name, dependencies, originalCallback) => {
  // Chrome doesn't run the same content script multiple times, while Firefox does. Since each content script and their
  // chunks are intended to be run only once, we should just ignore any attempts of running the same module more than
  // once. Names of the modules are assumed to be unique.
  if (definedModules.has(name)) {
    return;
  }

  definedModules.add(name);

  originalDefine(name, dependencies, function () {
    const callbackResult = originalCallback(...arguments);

    // Workaround for the entry script not returning anything causing AMD-Lite to send warning about modules not
    // being loaded/not existing.
    return callbackResult !== undefined ? callbackResult : {};
  });

  // Schedule the auto run on the next available frame. Firefox and Chromium have a lot of differences in how they
  // decide to execute content scripts. For example, Firefox might decide to skip a frame before attempting to load
  // different groups of them. Chromium on the other hand doesn't have that issue, but it doesn't allow us to, for
  // example, schedule a microtask to run the modules.
  scheduleModulesAutoRun();
}

amdLite.init({
  publicScope: window
});
