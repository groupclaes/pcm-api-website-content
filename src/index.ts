import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import process, { env } from 'process'

import config from './config'
import bannersController from './controllers/banners.controller'

let fastify: FastifyInstance | undefined

/** Main loop */
async function main() {
  // add jwt configuration object to config
  fastify = await Fastify({ ...config.wrapper })
  const version_prefix = (env.APP_VERSION ? '/' + env.APP_VERSION : '')
  await fastify.register(bannersController, { prefix: `${version_prefix}/${config.wrapper.serviceName}`, logLevel: 'info' })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })
}

['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    await fastify?.close()
    process.exit(0)
  })
})

main()