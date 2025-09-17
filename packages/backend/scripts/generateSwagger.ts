import { buildSwaggerSpec, writeSwaggerFiles } from '../src/config/swagger/specBuilder';
import { logger } from '../src/core/utils/logger';

(async () => {
  try {
    logger.info('Generating Swagger specification (force rebuild)');
    const { spec, sources } = buildSwaggerSpec(true);
    logger.info({ sourcesCount: sources.length }, 'Swagger spec built from sources');
    writeSwaggerFiles(spec);
    logger.info('Swagger JSON generated successfully');
  } catch (error) {
    logger.error(error as Error, 'Failed to generate swagger documentation');
    console.error(error);
    process.exit(1);
  }
})();
