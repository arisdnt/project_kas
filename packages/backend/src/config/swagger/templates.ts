export const swaggerAnnotationTemplate = `/**
 * @swagger
 * /api/resource:
 *   get:
 *     tags: [Resource]
 *     summary: Ringkasan operasi
 *     description: Deskripsi detail operasi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contoh:
 *                 type: string
 *                 description: Field contoh
 *     responses:
 *       200:
 *         description: Operasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */`;

export const getCrudSwaggerTemplates = (resource: string, basePath: string) => ({
  list: swaggerAnnotationTemplate
    .replace('/api/resource', basePath)
    .replace('get:', 'get:')
    .replace('[Resource]', `[${resource}]`),
  create: swaggerAnnotationTemplate
    .replace('/api/resource', basePath)
    .replace('get:', 'post:')
    .replace('[Resource]', `[${resource}]`),
  detail: swaggerAnnotationTemplate
    .replace('/api/resource', `${basePath}/{id}`)
    .replace('get:', 'get:')
    .replace('[Resource]', `[${resource}]`),
  update: swaggerAnnotationTemplate
    .replace('/api/resource', `${basePath}/{id}`)
    .replace('get:', 'put:')
    .replace('[Resource]', `[${resource}]`),
  remove: swaggerAnnotationTemplate
    .replace('/api/resource', `${basePath}/{id}`)
    .replace('get:', 'delete:')
    .replace('[Resource]', `[${resource}]`)
});
