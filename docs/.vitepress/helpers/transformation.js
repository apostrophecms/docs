export function shouldTranspile(code) {
  // Patterns that indicate CommonJS usage
  const cjsPatterns = {
    require: /\brequire\s*\(/,
    moduleExports: /\bmodule\.exports\b/,
    exports: /\bexports\.\w+\s*=/
  };

  // Skip specific cases first
  const skipCases = [
    /njk-html/,
    /nunjucks/,
    /<template>/,
    /\{\{.*\}\}/,
    /\/\/ skip-transform/
  ];

  if (skipCases.some(pattern => pattern.test(code))) {
    return false;
  }

  // Check if it's CommonJS
  const hasModulePatterns =
    cjsPatterns.require.test(code) ||
    cjsPatterns.moduleExports.test(code) ||
    cjsPatterns.exports.test(code);

  if (!hasModulePatterns) {
    return false;
  };

  // Don't transform if it's already using ESM
  const hasESMImports = /\b(import|export)\b/.test(code);
  if (hasESMImports) {
    return false;
  }

  return true;
};

export function transformToESM(code) {
  try {
    let esmCode = code;
    const imports = new Set();
    const namedExports = [];

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
      const warning = moduleName.startsWith('.') ? ' // Note: You may need to add the file extension for ESM' : '';
      return `import { ${importList} } from '${moduleName}'${warning}`;
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
      const [ fullMatch, key, value ] = matches;
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
};
