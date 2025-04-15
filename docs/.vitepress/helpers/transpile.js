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

      // Check if it's a compact format (no newlines after opening brace)
      const isCompactFormat = esmCode.match(/apostrophe\(\s*{\s*\w+/);

      if (isCompactFormat) {
        // Handle compact formatting
        esmCode = esmCode.replace(/apostrophe\(\s*{/g,
          'apostrophe({\n  root: import.meta,  ');
      } else {
        // Handle standard formatting with newlines, but avoid adding extra blank lines
        esmCode = esmCode.replace(/apostrophe\(\s*{\s*\n/g,
          'apostrophe({\n  root: import.meta,');
      }

      return esmCode;
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

    // Handle simple requires with warning for relative imports
    const simpleRequireRegex = /(?:const|let|var)\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    esmCode = esmCode.replace(simpleRequireRegex, (match, varName, moduleName) => {
      const warning = moduleName.startsWith('.') ? ' // Note: You may need to add the file extension for ESM' : '';
      return `import ${varName} from '${moduleName}'${warning}`;
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

    // Handle module.exports
    const moduleExportsRegex = /module\.exports\s*=\s*/;
    if (moduleExportsRegex.test(esmCode)) {
      esmCode = esmCode.replace(moduleExportsRegex, 'export default ');
    }

    // Clean up empty lines
    esmCode = esmCode
      .split('\n')
      .filter(line => line.trim() !== '')
      .join('\n');

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
      // First, remove the root: import.meta line
      cjsCode = cjsCode.replace(/\s*root:\s*import\.meta,?\s*/g, '');

      // Then transform the import and function call
      // Use a more relaxed pattern that preserves comments
      const importPattern = /import\s+apostrophe\s+from\s+['"]apostrophe['"];/;
      if (importPattern.test(cjsCode)) {
        // Remove the import line
        cjsCode = cjsCode.replace(importPattern, '');

        // Replace the apostrophe function call
        cjsCode = cjsCode.replace(/apostrophe\s*\(/g, 'require(\'apostrophe\')(');

        // Clean up any excessive newlines
        cjsCode = cjsCode.replace(/\n{3,}/g, '\n\n');
      }

      return cjsCode;
    }

    // Transform default exports
    cjsCode = cjsCode.replace(/export\s+default\s+([^;]+);?/, 'module.exports = $1;');

    // Transform named exports
    cjsCode = cjsCode.replace(/export\s+const\s+(\w+)\s*=\s*([^;]+);/g, 'exports.$1 = $2;');

    // Handle async and regular function exports
    cjsCode = cjsCode.replace(/export\s+(async\s+)?function\s+(\w+)/g, 'exports.$2 = $1function');

    // Transform class exports
    cjsCode = cjsCode.replace(/export\s+class\s+(\w+)/g, 'exports.$1 = class');

    // Transform imports
    cjsCode = cjsCode.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, 'const $1 = require(\'$2\');');

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
