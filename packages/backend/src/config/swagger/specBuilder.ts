import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { logger } from '@/core/utils/logger';
import { swaggerDefinition, swaggerOutputPath } from './definition';
import { collectSwaggerSourceFiles, resolveBackendRoot } from './fileLocator';

let cachedSpec: swaggerJSDoc.OAS3Definition | null = null;
let cachedSources: string[] = [];

const buildOptions = (apis: string[]): swaggerJSDoc.Options => ({
  definition: swaggerDefinition,
  apis
});

export const buildSwaggerSpec = (force = false) => {
  if (cachedSpec && !force) {
    return { spec: cachedSpec, sources: cachedSources };
  }

  const sources = collectSwaggerSourceFiles();

  const spec = swaggerJSDoc(buildOptions(sources));
  cachedSpec = spec as swaggerJSDoc.OAS3Definition;
  cachedSources = sources;

  logger.debug({ sources: sources.length }, 'Swagger spec generated');

  return { spec: cachedSpec, sources: cachedSources };
};

export const writeSwaggerFiles = (spec: swaggerJSDoc.OAS3Definition) => {
  const backendRoot = resolveBackendRoot();

  const targets = [
    path.join(backendRoot, swaggerOutputPath.src),
    path.join(backendRoot, swaggerOutputPath.dist)
  ];

  const json = JSON.stringify(spec, null, 2);

  for (const target of targets) {
    const dir = path.dirname(target);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, json, 'utf-8');
    logger.info({ target }, 'Swagger JSON written');
  }
};
