import type { VXSRouter } from '../interfaces/router'

/** Resolve an href object into a fully qualified, relative href. */
export const resolveHref = (href: VXSRouter.Href): string => {
  if (typeof href === 'string') {
    return resolveHref({ pathname: href })
  }
  const path = href.pathname ?? ''
  if (!href?.params) {
    return path
  }
  const { pathname, params } = createQualifiedPathname(path, {
    ...href.params,
  })
  const paramsString = createQueryParams(params)
  return pathname + (paramsString ? `?${paramsString}` : '')
}

function createQualifiedPathname(
  pathname: string,
  params: Record<string, any>
): { pathname: string; params: VXSRouter.UnknownInputParams } {
  for (const [key, value = ''] of Object.entries(params)) {
    const dynamicKey = `[${key}]`
    const deepDynamicKey = `[...${key}]`
    if (pathname.includes(dynamicKey)) {
      pathname = pathname.replace(dynamicKey, encodeParam(value))
    } else if (pathname.includes(deepDynamicKey)) {
      pathname = pathname.replace(deepDynamicKey, encodeParam(value))
    } else {
      continue
    }

    delete params[key]
  }
  return { pathname, params }
}

function encodeParam(param: any): string {
  return Array.isArray(param)
    ? param.map((p) => encodeParam(p)).join('/')
    : encodeURIComponent(`${param}`)
}

function createQueryParams(params: Record<string, any>): string {
  return (
    Object.entries(params)
      // Allow nullish params
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
      .join('&')
  )
}
