import sql from 'mssql'
import db from '../db'
import { FastifyBaseLogger } from 'fastify'

const DB_NAME = 'PCM'

export default class Banner {
  schema: string = '[dbo].'
  _logger: FastifyBaseLogger

  constructor(logger: FastifyBaseLogger) { this._logger = logger }

  async get(company: string, page: string) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('company', sql.Char, company)
    r.input('page', sql.Char, page)
    this._logger.debug({ sqlParam: { company, page }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_getBannerImages]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_getBannerImages]')
    this._logger.debug({ result }, 'procedure result')

    return result.recordset.length > 0 ? result.recordset[0] : undefined
  }
}