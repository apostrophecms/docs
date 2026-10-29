export function detectModuleFormat(code) {
  const skipCases = [
    /njk-html/,
    /nunjucks/,
    /<template>/,
    /\{\{.*\}\}/
  ];

  // Check if we should skip
  const shouldSkip = skipCases.some(pattern => {
    const matches = pattern.test(code);
    return matches;
  });

  if (shouldSkip) {
    return {
      format: null,
      canTransform: false
    };
  }

  const hasCJS =
    /\brequire\s*\(/.test(code) ||
    /\bmodule\.exports\b/.test(code) ||
    /\bexports\.\w+\s*=/.test(code);

  const hasESM = /\b(import|export)\b/.test(code);

  if (hasCJS && !hasESM) {
    return {
      format: 'cjs',
      canTransform: true
    };
  }

  if (hasESM && !hasCJS) {
    return {
      format: 'esm',
      canTransform: true
    };
  }

  return {
    format: null,
    canTransform: false
  };
}

// CJS to ESM transformation function
export function transpileToESM(code) {
  try {
    let esmCode = code;
    const imports = new Set();
    const namedExports = [];

    // Special case for apostrophe
    const apostrophePattern = /require\(['"]apostrophe['"]\)\s*\(/;
    if (apostrophePattern.test(esmCode)) {
      // First, transform the basic import pattern
      esmCode = esmCode.replace(/require\(['"]apostrophe['"][\s\S]*?\)\s*\(/g,
        "import apostrophe from 'apostrophe';\n\napostrophe(");

      // Add `root: import.meta` as the first property, matching the
      // sample's layout (multi-line or everything on one line)
      esmCode = esmCode
        .replace(/apostrophe\(\s*\{[ \t]*\n/g, 'apostrophe({\n  root: import.meta,\n')
        .replace(/apostrophe\(\s*\{[ \t]*(?=[^\s}])/g, 'apostrophe({ root: import.meta, ');
      // Keep going so other requires in the same sample are converted too
    }

    // Handle immediate require calls - pattern: require('x')({ ... })
    esmCode = esmCode.replace(/require\(['"]([^'"]+)['"]\)\s*\(/g, (match, moduleName) => {
      const varName = moduleName.replace(/[@/-]/g, '_');
      imports.add(`import ${varName} from '${moduleName}';`);
      return `${varName}(`;
    });

    // Handle destructured requires with warning for relative imports
    const destructuredRequireRegex = /const\s*{\s*([\w\s,:\n]+?)}\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    esmCode = esmCode.replace(destructuredRequireRegex, (match, imports, moduleName) => {
      const importList = imports
        .split(',')
        .map(i => i.trim())
        .map(i => {
          const [name, alias] = i.split(':').map(s => s.trim());
          return alias ? `${name} as ${alias}` : name;
        })
        .join(', ');
      const extension = moduleName.startsWith('.') && !moduleName.endsWith('.js') ? '.js' : '';
      return `import { ${importList} } from '${moduleName}${extension}'`;
    });

    // Handle simple requires; ESM needs the extension on relative paths
    // Skips chained calls like require('util').promisify(...), which have
    // no direct import equivalent
    const simpleRequireRegex = /(?:const|let|var)\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)(?!\s*[.([])/g;
    esmCode = esmCode.replace(simpleRequireRegex, (match, varName, moduleName) => {
      const extension = moduleName.startsWith('.') && !/\.[cm]?js$/.test(moduleName) ? '.js' : '';
      return `import ${varName} from '${moduleName}${extension}'`;
    });

    // First, collect all individual exports
    let matches;
    const exportsRegex = /exports\.(\w+)\s*=\s*([^;]+);/g;
    while ((matches = exportsRegex.exec(code)) !== null) {
      const [fullMatch, key, value] = matches;
      namedExports.push(`export const ${key} = ${value}`);
      // Remove the export from the code
      esmCode = esmCode.replace(fullMatch, '');
    }

    // CJS globals that ESM exposes on import.meta
    esmCode = esmCode
      .replace(/\b__dirname\b/g, 'import.meta.dirname')
      .replace(/\b__filename\b/g, 'import.meta.filename');

    // Handle module.exports. Global, because some samples show
    // alternatives ("// OR") with more than one module.exports
    esmCode = esmCode.replace(/module\.exports\s*=\s*/g, 'export default ');

    // Collapse gaps left by removed exports, keeping intentional blank lines
    esmCode = esmCode.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n').replace(/^\n+/, '');

    // Add collected imports at the start if we have any from immediate requires
    if (imports.size > 0) {
      esmCode = Array.from(imports).join('\n') + '\n\n' + esmCode;
    }

    // Add named exports before default export if they exist
    if (namedExports.length > 0) {
      const defaultExportMatch = esmCode.match(/export default [\s\S]+$/);
      if (defaultExportMatch) {
        // If there's a default export, put named exports before it
        const defaultExport = defaultExportMatch[0];
        esmCode = esmCode.replace(defaultExport, '');
        esmCode = `${esmCode}\n\n${namedExports.join(';\n')};\n\n${defaultExport}`;
      } else {
        // If no default export, just add named exports at the end
        esmCode = `${esmCode}\n\n${namedExports.join(';\n')};`;
      }
    }

    return esmCode;
  } catch (error) {
    console.error('Error transforming to ESM:', error);
    return code;
  }
}

// ESM to CJS transformation function
export function transpileToCJS(code) {
  try {
    let cjsCode = code;

    // Special case for apostrophe with import.meta
    const apostropheEsmPattern = /import\s+apostrophe\s+from\s+['"]apostrophe['"]/;
    const importMetaPattern = /root:\s*import\.meta/;

    if (apostropheEsmPattern.test(cjsCode) && importMetaPattern.test(cjsCode)) {
      // First, remove `root: import.meta`, whether on its own line or inline
      cjsCode = cjsCode
        .replace(/^[ \t]*root:\s*import\.meta,?[ \t]*\n/gm, '')
        .replace(/root:\s*import\.meta,?\s*/g, '');

      // Then transform the import and function call
      // Use a more relaxed pattern that preserves comments
      const importPattern = /import\s+apostrophe\s+from\s+['"]apostrophe['"];/;
      if (importPattern.test(cjsCode)) {
        // Remove the import line
        cjsCode = cjsCode.replace(importPattern, '');

        // Replace the apostrophe function call
        cjsCode = cjsCode.replace(/apostrophe\s*\(/g, 'require(\'apostrophe\')(');

        // Clean up any excessive newlines
        cjsCode = cjsCode.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
      }
      // Keep going so other imports in the same sample are converted too
    }

    cjsCode = cjsCode
      .replace(/\bimport\.meta\.dirname\b/g, '__dirname')
      .replace(/\bimport\.meta\.filename\b/g, '__filename');

    // Transform default exports. Global, because some samples show
    // alternatives ("// OR") with more than one default export
    cjsCode = cjsCode.replace(/export\s+default\s+/g, 'module.exports = ');

    // Transform named exports
    cjsCode = cjsCode.replace(/export\s+const\s+(\w+)\s*=\s*([^;]+);/g, 'exports.$1 = $2;');

    // Handle async and regular function exports
    cjsCode = cjsCode.replace(/export\s+(async\s+)?function\s+(\w+)/g, 'exports.$2 = $1function');

    // Transform class exports
    cjsCode = cjsCode.replace(/export\s+class\s+(\w+)/g, 'exports.$1 = class');

    // Transform imports
    cjsCode = cjsCode.replace(
      /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?(?:\s*with\s*\{[^}]*\})?;?/g,
      'const $1 = require(\'$2\');'
    );

    // Handle named imports
    cjsCode = cjsCode.replace(
      /import\s*{\s*([\w\s,]+)\s*}\s*from\s+['"]([^'"]+)['"];?/g,
      (match, imports, moduleName) => {
        const importList = imports
          .split(',')
          .map(i => i.trim())
          .map(i => {
            const [name, alias] = i.split(/\s+as\s+/).map(s => s.trim());
            return alias ? `  ${alias}: ${name}` : `  ${name}`;
          })
          .join(',\n');
        return `const {\n${importList}\n} = require('${moduleName}');`;
      }
    );

    // Handle import * as syntax
    cjsCode = cjsCode.replace(
      /import\s*\*\s*as\s*(\w+)\s*from\s+['"]([^'"]+)['"];?/g,
      'const $1 = require(\'$2\');'
    );

    return cjsCode;
  } catch (error) {
    console.error('Error transforming to CJS:', error);
    return code;
  }
}
