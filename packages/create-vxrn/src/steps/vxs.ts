import ansis from 'ansis'

import type { ExtraSteps } from './types'

const main: ExtraSteps = async ({ isFullClone, projectName, packageManager }) => {
  const useBun = packageManager === 'bun'

  const runCommand = (scriptName: string) =>
    `${packageManager} ${useBun ? '' : 'run '}${scriptName}`

  if (isFullClone) {
    console.info(`
${ansis.green.bold('Done!')} Created a new project under ./${ansis.greenBright(projectName)} visit your project:
 • ${ansis.green('cd')} ${projectName}
`)
  }
  console.info(`
To start the dev server, run: ${ansis.green(runCommand('dev'))}
`)
}

export default main
