- support export ending in `Page` instead of just `export default` for routes (hot reload friendly)
  - support export default hot reloads (would require react-refresh changes)

- platform-specific route files

- avoid work on hard reloads
  - we keep a Map of built modules => source
  - we hook into viteServer.watcher and track changes
  - add a rollup plugin to the build
    - if not changed, return the og source
    - could maybe be better than this too

- we should redo our prebuild react-native system to instead just use our patches/depsPatches system + support using their native react/react-dom versions at leasts optionally

- add test to weird-deps so we know no regressions

- ScrollRestoration seems to have regressed (site not doing it consistently)
  - also we should default this on but have a way to turn it off

- dep issues

  -  ../../node_modules/@sentry/react-native/dist/js/utils/environment.js (1:9): "version" is not exported by "virtual:rn-internals:react-native/Libraries/Core/ReactNativeVersion", imported by "../../node_modules/@sentry/react-native/dist/js/utils/environment.js".


- turn this back off VXRN_ENABLE_SOURCE_MAP:
  - https://github.com/swc-project/swc/issues/9416

- for some reason rollup newer versions have syntax error on trying to load native bundle on basic starter

- RootErrorBoundary and errors in general need love
  - bring back some form of useMetroSymbolication
- safe-area-context should be configurable to leave it out entirely if you want

- vxs should have more than just patches, but also config that is set per-node_module
  - eg, react 19 sets: 'process.env.TAMAGUI_REACT_19': '"1"'
  - another cool idea: node_modules package.json sets "vite" field that can add these custom configs, so `tamagui` package can define that *for* react 19

- docs section for tamagui, note one-theme

- changing vite.config seems to not close old server and so starts on new port, seeing this:

8:27:01 AM [vite] server restarted.
[vite] connected.
[vite] connected.
Port 5173 is in use, trying another one...
Server running on http://127.0.0.1:8082

- an easy way to disable swc transform for a node_module using `deps`

- @ethersproject/hash property "atob" doesnt exist

- TODO this would probably want to support their configured extensions
