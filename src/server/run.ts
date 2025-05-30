/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Vijay Kumar Guthi <vijaya.guthi@infitx.com>
 - Kevin Leyow <kevin.leyow@infitx.com>

 --------------
 ******/

import { Server } from '@hapi/hapi';
import { logger } from '../shared/logger';
import Config, { ServiceConfig } from '../shared/config';
import create from './create';
import start from './start';
import plugins from './plugins';
import { Util } from '@mojaloop/central-services-shared';


export default async function run(config: ServiceConfig): Promise<Server> {
  logger.info(JSON.stringify(Config.REDIS.connectionConfig));

  await Util.Endpoints.initializeCache(Config.CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG, {
    hubName: Config.HUB_PARTICIPANT.NAME,
    hubNameRegex: Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)
  });

  const kvs = new Util.Redis.RedisCache(Config.REDIS.connectionConfig);
  const pubSub = new Util.Redis.PubSub(Config.REDIS.connectionConfig);

  const server = await create({...config }, { logger, pubSub, kvs });
  await plugins.register(server);
  await start(server);
  return server;
}
