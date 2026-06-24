import { getPublicMenu, PublicMenuError } from './public.service.js'

export async function getRestaurantMenu(request, response) {
  try {
    const menu = await getPublicMenu(request.params.slug)
    return response.status(200).json(menu)
  } catch (error) {
    if (error instanceof PublicMenuError) {
      return response.status(error.statusCode).json({
        error: { code: error.code, message: error.message },
      })
    }

    console.error('Error interno al consultar la carta pública')
    return response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'No se pudo consultar la carta',
      },
    })
  }
}
