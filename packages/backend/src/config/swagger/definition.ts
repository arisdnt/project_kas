import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { version as packageVersion } from '../../../package.json';

export const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'Sistem POS API',
    version: packageVersion ?? '1.0.0',
    description: 'Dokumentasi REST API Sistem POS real-time multi-tenant.',
    contact: {
      name: 'Sistem POS Team',
      email: 'support@sistempos.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development API Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 120
          },
          page: {
            type: 'integer',
            example: 1
          },
          totalPages: {
            type: 'integer',
            example: 12
          },
          limit: {
            type: 'integer',
            example: 10
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Terjadi kesalahan'
          },
          errors: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Validasi gagal'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email'
                },
                message: {
                  type: 'string',
                  example: 'Alamat email tidak valid'
                }
              }
            }
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operasi berhasil'
          }
        }
      }
    },
    parameters: {
      PaginationPage: {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        },
        description: 'Nomor halaman (>= 1)'
      },
      PaginationLimit: {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        },
        description: 'Jumlah data per halaman'
      },
      SearchQuery: {
        in: 'query',
        name: 'search',
        schema: {
          type: 'string'
        },
        description: 'Pencarian bebas'
      }
    },
    responses: {
      Unauthorized: {
        description: 'Tidak memiliki kredensial yang valid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      Forbidden: {
        description: 'Tidak memiliki izin',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      NotFound: {
        description: 'Data tidak ditemukan',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      ValidationFailed: {
        description: 'Request tidak lolos validasi',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError'
            }
          }
        }
      },
      InternalError: {
        description: 'Kesalahan tidak terduga',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

export const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sistem POS API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    displayOperationId: false,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
};

export const swaggerOutputPath = Object.freeze({
  dist: path.join('dist', 'config', 'swagger.json'),
  src: path.join('src', 'config', 'swagger.json')
});
