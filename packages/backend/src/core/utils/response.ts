import { Response } from 'express'

export interface ApiResponseData {
  success: boolean
  message: string
  data?: any
  errors?: any
}

export class ApiResponse {
  static success(res: Response, data: any = null, message: string = 'Success'): Response {
    return res.status(200).json({
      success: true,
      message,
      data
    })
  }

  static created(res: Response, data: any = null, message: string = 'Created'): Response {
    return res.status(201).json({
      success: true,
      message,
      data
    })
  }

  static badRequest(res: Response, message: string = 'Bad Request', errors: any = null): Response {
    return res.status(400).json({
      success: false,
      message,
      errors
    })
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return res.status(401).json({
      success: false,
      message
    })
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return res.status(403).json({
      success: false,
      message
    })
  }

  static notFound(res: Response, message: string = 'Not Found'): Response {
    return res.status(404).json({
      success: false,
      message
    })
  }

  static conflict(res: Response, message: string = 'Conflict'): Response {
    return res.status(409).json({
      success: false,
      message
    })
  }

  static serverError(res: Response, message: string = 'Internal Server Error'): Response {
    return res.status(500).json({
      success: false,
      message
    })
  }

  static custom(res: Response, statusCode: number, data: ApiResponseData): Response {
    return res.status(statusCode).json(data)
  }
}