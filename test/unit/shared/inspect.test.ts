/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Paweł Marzec <pawel.marzec@modusbox.com>
 --------------
 ******/
import config from '~/shared/config'
import inspect from '~/shared/inspect'
import util from 'util'
const inspectSpy = jest.spyOn(util, 'inspect')

describe('shared/inspect', (): void => {
  it('should properly call util.inspect', (): void => {
    const result = inspect({})
    expect(result).toEqual('{}')
    expect(inspectSpy).toHaveBeenCalledWith({}, false, 4, true)
  })

  it('should call util.inspect with defaults', (): void => {
    // remove config.inspect so defaults will be used
    const storeBeforeDelete = config.INSPECT

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete config.INSPECT

    const inspectSpy = jest.spyOn(util, 'inspect')
    const result = inspect({})

    expect(config).toBeDefined()
    expect(result).toEqual('{}')
    expect(inspectSpy).toHaveBeenCalledWith({}, false, 5, true)

    // restore INSPECT to not interfere other tests
    config.INSPECT = storeBeforeDelete
  })
})
