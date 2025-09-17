import { Express, Request, Response, RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';
import { logger } from '@/core/utils/logger';
import { buildSwaggerSpec } from './specBuilder';
import { swaggerUiOptions } from './definition';

const sendSwaggerJson = (req: Request, res: Response) => {
  const refresh = req.query.refresh === 'true';
  const { spec, sources } = buildSwaggerSpec(refresh);

  const document = JSON.parse(JSON.stringify(spec));
  document.servers = [
    {
      url: `${req.protocol}://${req.get('host')}/api`,
      description: 'Runtime environment'
    }
  ];

  const payload = {
    ...document,
    'x-generated-at': new Date().toISOString(),
    'x-source-files': sources
  };

  res.json(payload);
};

export const registerSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve as unknown as RequestHandler);

  app.get('/api-docs', (req, res) => {
    const refresh = req.query.refresh === 'true';
    const { spec } = buildSwaggerSpec(refresh);
    logger.info({ refresh }, 'Serving Swagger UI');
    const document = JSON.parse(JSON.stringify(spec));
    document.servers = [
      {
        url: `${req.protocol}://${req.get('host')}/api`,
        description: 'Runtime environment'
      }
    ];

    res.send(swaggerUi.generateHTML(document, swaggerUiOptions));
  });

  app.get('/api-docs/swagger.json', sendSwaggerJson);
  app.get('/api-docs.json', sendSwaggerJson);
};
