export function handleInvalidJson(error, _request, response, next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'El cuerpo JSON no es válido',
      },
    })
  }

  return next(error)
}
