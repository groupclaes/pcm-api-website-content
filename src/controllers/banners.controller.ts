import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'
import Banner from '../models/banner.repository'
import { groupBy } from '../tools/groupBy'

declare module 'fastify' {
  export interface FastifyRequest {
    jwt: JWTPayload
    hasRole: (role: string) => boolean
    hasPermission: (permission: string, scope?: string) => boolean
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

export default async function (fastify: FastifyInstance) {
  /**
   * @route GET /{APP_VERSION}/website-content/:company/banners/:page
   */
  fastify.get('/:company/banners/:page', async function (request: FastifyRequest<{
    Params: {
      company: string,
      page: string
    }
  }>, reply: FastifyReply) {
    const start = performance.now()

    try {
      const repo = new Banner(request.log)
      const banners = await repo.get(request.params.company, request.params.page)

      if (banners && banners.length > 0) {
        const groupedItems = groupBy(banners, 'objectId')

        let response = {
          banners: {},
          count: 0
        }

        for (let key in groupedItems) {
          const item = groupedItems[key][0]

          response.count++
          response.banners[key] = {
            meta: item.meta,
            documents: groupedItems[key].map(e => ({
              size: e.size.replace('size.', ''),
              url: `https://pcm.groupclaes.be/${process.env.APP_VERSION}/content/${request.params.company}/website/banner-image/${key}/${e.languages[0].name}?size=${e.size.replace('size.', '')}`,
              languages: e.languages.map(e => e.name)
            }))
          }
        }
        return reply.success({ ...response }, 200, performance.now() - start)
      }
      return reply.error('No banners not found!', 404, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to get banners')
      return reply.error('failed to get banners')
    }
  })
}
