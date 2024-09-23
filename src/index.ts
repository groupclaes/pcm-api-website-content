import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import { env } from 'process'

import bannersController from './controllers/banners.controller'

const LOGLEVEL = 'debug'

export default async function (config: any): Promise<FastifyInstance | undefined> {
  if (!config || !config.wrapper) return

  // add jwt configuration object to config
  const fastify = await Fastify({ ...config.wrapper })
  const version_prefix = env.APP_VERSION ? '/' + env.APP_VERSION : ''
  fastify.log.level = LOGLEVEL
  await fastify.register(bannersController, { prefix: `${version_prefix}/${config.wrapper.serviceName}`, logLevel: LOGLEVEL })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })

  return fastify
}