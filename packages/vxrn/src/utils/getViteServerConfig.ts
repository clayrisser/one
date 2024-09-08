import { loadConfigFromFile, mergeConfig, type InlineConfig, type UserConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { webExtensions } from '../constants'
import { getServerConfigPlugin } from '../plugins/clientInjectPlugin'
import { expoManifestRequestHandlerPlugin } from '../plugins/expoManifestRequestHandlerPlugin'
import { reactNativeHMRPlugin } from '../plugins/reactNativeHMRPlugin'
import { getBaseViteConfig } from './getBaseViteConfig'
import { getOptimizeDeps } from './getOptimizeDeps'
import type { VXRNOptionsFilled } from './getOptionsFilled'
import { mergeUserConfig } from './mergeUserConfig'

export async function getViteServerConfig(config: VXRNOptionsFilled) {
  const { root, host, https, port } = config
  const { optimizeDeps } = getOptimizeDeps('serve')
  const { config: userViteConfig } =
    (await loadConfigFromFile({
      mode: 'dev',
      command: 'serve',
    })) ?? {}

  // TODO: can we move most of this into `vxs` plugin:
  let serverConfig: UserConfig = mergeConfig(
    getBaseViteConfig({
      mode: 'development',
    }),

    {
      root,
      appType: 'custom',
      clearScreen: false,
      publicDir: 'public',
      plugins: [
        getServerConfigPlugin(),

        https ? mkcert() : null,

        // temp fix
        // avoid logging the optimizeDeps we add that aren't in the app:
        // likely we need a whole better solution to optimize deps
        {
          name: `avoid-optimize-logs`,

          configureServer() {
            const ogWarn = console.warn
            console.warn = (...args: any[]) => {
              if (
                typeof args[0] === 'string' &&
                args[0].startsWith(`Failed to resolve dependency:`)
              ) {
                return
              }
              return ogWarn(...args)
            }
          },
        },

        reactNativeHMRPlugin(config),

        expoManifestRequestHandlerPlugin({
          projectRoot: root,
          port,
        }),

        // TODO very hacky/arbitrary
        {
          name: 'process-env-ssr',
          transform(code, id, options) {
            if (id.includes('node_modules')) return
            if (code.includes('process.env.TAMAGUI_IS_SERVER')) {
              return code.replaceAll('process.env.TAMAGUI_IS_SERVER', `${!!options?.ssr}`)
            }
          },
        },
      ],

      ssr: {
        optimizeDeps,
      },

      environments: {
        client: {
          dev: {
            optimizeDeps: {
              include: ['react-native-screens'],
              esbuildOptions: {
                resolveExtensions: webExtensions,
              },
            },
          },
        },
      },

      server: {
        hmr: {
          path: '/__vxrnhmr',
        },
        cors: true,
        host,
      },
    } satisfies UserConfig
  ) satisfies InlineConfig

  const rerouteNoExternalConfig = userViteConfig?.ssr?.noExternal === true
  if (rerouteNoExternalConfig) {
    delete userViteConfig.ssr!.noExternal
  }

  serverConfig = mergeUserConfig(optimizeDeps, serverConfig, userViteConfig)

  if (rerouteNoExternalConfig) {
    serverConfig.ssr!.noExternal = true
  }

  // manually merge
  if (process.env.DEBUG) {
    // console.debug('user config in:', JSON.stringify(userViteConfig, null, 2), `\n----\n`)
    console.debug('merged config:', JSON.stringify(serverConfig, null, 2), `\n----\n`)
  }

  return serverConfig
}
