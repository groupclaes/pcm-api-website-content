import sql from 'mssql'
import { FastifyBaseLogger } from 'fastify'

export default class Banner {
  schema: string = 'dbo.'
  _logger: FastifyBaseLogger
  _pool: sql.ConnectionPool

  constructor(logger: FastifyBaseLogger, pool: sql.ConnectionPool) {
    this._logger = logger
    this._pool = pool
  }

  async get(company: string, page: string) {
    const r = new sql.Request(this._pool)
    r.input('company', sql.Char, company)
    r.input('page', sql.Char, page)
    this._logger.debug({ sqlParam: { company, page }, sqlSchema: this.schema, sqlProc: '[usp_getBannerImages]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_getBannerImages]')
    this._logger.debug({ result }, 'procedure result')

    return result.recordset.length > 0 ? result.recordset[0] : undefined
  }
}