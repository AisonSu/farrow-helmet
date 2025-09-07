import { Response, useReq, useRes, HttpMiddleware } from 'farrow-http'
import {HelmetOptions, default as helmetExpress} from 'helmet'
export const helmet = (options?:HelmetOptions): HttpMiddleware => {
  const helmet=helmetExpress(options)
  return async (request, next) => {
    const req = useReq()
    const res = useRes()
    const resp=next(request)
    try {
      helmet(req,res,()=>{})
    } catch (error: any) {
      return Response.status(500).text(error.message)
    }
    return resp
  }
}
