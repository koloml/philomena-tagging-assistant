/**
 * # CJS → AMD module format converter.
 *
 * Incredibly scary and potentially unstable way to bring back AMD modules on Vite 8+. Converts require() calls into
 * list of dependencies and forms define() function with module name, dependencies and exports.
 *
 * @return {import('vite').Plugin}
 */
export function ConvertCjsToAmd() {
  const requireAssignmentsRegExp = /(?:const\s*|,\s*)(?<variable>[a-z0-9_$]+)\s*=\s*require\((?<path>['"][^'"]+['"])\)/iy;
  const inlineRequireRegExp = /require\((?<path>['"][^'"]+['"])\)\.(?<variable>[a-z0-9_$]+)/gi
  const exportsDefinitionRegExp = /Object.defineProperty\(exports,['"](?<export_variable>[^'"]+)['"],{enumerable:!\d,get:function\(\){return\s*(?<assigned_variable>[^};]+)}}\)(?<separator>[,;])/gi;
  const exportVariablePrefix = "$";
  const exportVariableCollisionsRegExp = /\$[a-z_$]+/g;
  const amdExportsModule = '"exports"';

  /**
   * Clears the name of the module to be fit with what we had before.
   * @param {string} path Path to normalize.
   * @returns {string} Normalized path.
   */
  function normalizeDependencyName(path) {
    return path.replace(/\.js(['"])$/, "$1");
  }

  /**
   * Deduce the potentially unused variable from the current code. Uses special rarely encountered prefix.
   * @param {string} code Code to parse the used symbols from. Ideally, code should be passed here before any
   * replacements.
   * @param {Set<string>} usedSymbols Set of symbols which were already used or found in code.
   * @returns {string} Not-yet used variable which is likely safe to use.
   */
  function findUnusedSpecialVariable(code, usedSymbols) {
    // Run complete scan of the source code first, to find any potential collisions.
    if (!usedSymbols.size) {
      let match;

      exportVariableCollisionsRegExp.lastIndex = 0;

      while (match = exportVariableCollisionsRegExp.exec(code)) {
        usedSymbols.add(match[0]);
      }
    }

    if (!usedSymbols.size || !usedSymbols.has(exportVariablePrefix)) {
      usedSymbols.add(exportVariablePrefix);
      return exportVariablePrefix;
    }

    let count = 0;
    let resultVariable;

    do {
      resultVariable = exportVariablePrefix + count.toString(36);
    } while (count++ < 1000 && usedSymbols.has(resultVariable));

    if (usedSymbols.has(resultVariable)) {
      throw new Error('Failed to convert CJS to AMD: Failed to find non-colliding variable after 100 tries!');
    }

    usedSymbols.add(resultVariable);
    return resultVariable;
  }

  /**
   * Main function doing the conversion of one chunk.
   * @param {import('rolldown').OutputChunk} chunk
   */
  function convertChunkToAmd(chunk) {
    /** @type {string} */
    let chunkCode = chunk.code;
    let lastRequireIndex = 0;
    /**
     * Saved per-chunk set of used symbols. This set is reused for multiple calls to not parse code multiple times.
     * @type {Set<string>}
     */
    const chunkUsedSymbols = new Set();

    /** @type {Record<string, string>} */
    let dependenciesVarsToPaths = {};

    // region Extracting `const x = require()` calls from the start of the source code...

    do {
      requireAssignmentsRegExp.lastIndex = lastRequireIndex;
      const result = requireAssignmentsRegExp.exec(chunkCode);

      if (!result) {
        break;
      }

      dependenciesVarsToPaths[result.groups.variable] = normalizeDependencyName(result.groups.path);
      lastRequireIndex += result["0"].length;
    } while (true);

    if (lastRequireIndex > 0) {
      const characterAfterRequires = chunkCode[lastRequireIndex];

      if (characterAfterRequires !== ';') {
        throw new Error("Failed to convert CJS to AMD: reached last require() assignment, but list didn't stop.");
      }
    }

    // endregion

    // region Finding and replacing inlined `require().x` calls...

    chunkCode = chunkCode.replaceAll(inlineRequireRegExp, (match, dependencyPath, variable) => {
      const dependencyVariable = findUnusedSpecialVariable(chunkCode, chunkUsedSymbols);
      dependenciesVarsToPaths[dependencyVariable] = dependencyPath;
      return `${dependencyVariable}.${variable}`;
    });

    // endregion

    // region Finding and replacing all exports with AMD exports...

    /** @type {string|undefined} */
    let chunkExportsVariable;

    exportsDefinitionRegExp.lastIndex = 0;

    chunkCode = chunkCode.replaceAll(exportsDefinitionRegExp, (substring, exportVariable, assignedVariable, separator) => {
      chunkExportsVariable ??= findUnusedSpecialVariable(chunkCode, chunkUsedSymbols);

      if (!(chunkExportsVariable in dependenciesVarsToPaths)) {
        dependenciesVarsToPaths = {
          [chunkExportsVariable]: amdExportsModule,
          ...dependenciesVarsToPaths,
        };
      }

      return `${chunkExportsVariable}.${exportVariable}=${assignedVariable}${separator}`;
    });

    // endregion

    const normalizedModuleName = normalizeDependencyName(`"${chunk.fileName}"`);
    const dependenciesVariables = Object.keys(dependenciesVarsToPaths).join(',');
    const dependenciesPaths = Object.values(dependenciesVarsToPaths).join(',');

    if (lastRequireIndex > 0) {
      chunkCode = chunkCode.substring(lastRequireIndex + 1);
    }

    chunk.code = `define(${normalizedModuleName},[${dependenciesPaths}],function(${dependenciesVariables}){${chunkCode}})`;
  }

  return {
    name: "koloml:covert-cjs-to-amd",
    apply: "build",
    enforce: "pre",

    /**
     * @param _
     * @param {Record<string, (import('rolldown').OutputBundle|import('rolldown').OutputChunk)>} bundle
     */
    generateBundle(_, bundle) {
      for (const chunkId in bundle) {
        const chunkOrAsset = bundle[chunkId];

        if (chunkOrAsset.type === 'asset') {
          continue;
        }

        convertChunkToAmd(chunkOrAsset);
      }
    }
  }
}
