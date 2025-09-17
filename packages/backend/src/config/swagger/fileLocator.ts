import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { logger } from '@/core/utils/logger';

const BACKEND_PACKAGE_NAME = 'backend';

const rootCandidates = [
  () => path.resolve(__dirname, '..', '..'),
  () => path.resolve(__dirname, '..', '..', '..'),
  () => path.resolve(__dirname, '..', '..', '..', '..'),
  () => process.cwd(),
  () => path.resolve(process.cwd(), '..')
];

const isBackendPackage = (candidate: string) => {
  try {
    const packageJsonPath = path.join(candidate, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.name === BACKEND_PACKAGE_NAME;
  } catch (error) {
    logger.warn({ error }, 'Failed to read package.json when resolving backend root');
    return false;
  }
};

export const resolveBackendRoot = () => {
  for (const resolver of rootCandidates) {
    const candidate = resolver();
    if (isBackendPackage(candidate)) {
      return candidate;
    }
  }

  logger.warn(
    { cwd: process.cwd(), moduleDir: __dirname },
    'Unable to resolve backend root precisely, fallback to current working directory'
  );
  return process.cwd();
};

const collectMatches = (backendRoot: string, patterns: string[]): string[] => {
  const entries = fg.sync(patterns, {
    cwd: backendRoot,
    absolute: true,
    onlyFiles: true,
    unique: true,
    suppressErrors: true
  });

  if (entries.length === 0) {
    logger.warn({ patterns }, 'No swagger source files matched');
  }

  return entries.map((filePath) => path.normalize(filePath));
};

export const collectSwaggerSourceFiles = () => {
  const backendRoot = resolveBackendRoot();

  const sourcePatterns = [
    'src/features/**/controllers/**/*Controller.ts',
    'src/features/**/controllers/**/*Controller.js',
    'src/core/**/controllers/**/*Controller.ts',
    'src/core/**/controllers/**/*Controller.js',
    'src/features/**/routes/**/*.{ts,js}',
    'src/core/**/routes/**/*.{ts,js}',
    'src/routes/**/*.{ts,js}'
  ];

  const buildPatterns = sourcePatterns.map((pattern) => pattern.replace('src/', 'dist/'));

  const matches = new Set<string>([
    ...collectMatches(backendRoot, sourcePatterns),
    ...collectMatches(backendRoot, buildPatterns)
  ]);

  const files = Array.from(matches);
  logger.debug({ count: files.length }, 'Swagger source files collected');

  return files;
};
