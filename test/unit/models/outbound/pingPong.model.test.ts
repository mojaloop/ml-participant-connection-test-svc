import { PingPongModel, create } from '~/models/outbound/pingPong.model';
import { PingPongData, PingPongModelConfig } from '~/models/outbound/pingPong.interface';
import { Util } from '@mojaloop/central-services-shared';
import mockLogger from '../../mockLogger'
import { ServiceConfig } from 'config/serviceConfig';
import { ILogger } from '~/shared/types';
import RedisClient from '../../__mocks__/redis';
import { PingStatus } from '~/shared/enums';

jest.mock('@mojaloop/central-services-shared', () => ({
  Util: {
    Redis: {
      PubSub: jest.fn().mockImplementation(() => ({
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      })),
      RedisCache: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
      })),
    },
    Endpoints: {
      getEndpoint: jest.fn(),
    },
    Request: {
      sendRequest: jest.fn(),
    },
    HeaderValidation: {
      getHubNameRegex: jest.fn(),
    },
  },
  Enum: {
    Http: {
      RestMethods: {
        POST: 'POST',
        PUT: 'PUT',
        GET: 'GET',
        DELETE: 'DELETE',
      },
    },
    EndPoints: {
      FspEndpointTypes: {
        FSPIOP_CALLBACK_URL_QUOTES: 'FSPIOP_CALLBACK_URL_QUOTES',
      },
    }
  },
}));


jest.mock('@mojaloop/sdk-standard-components', () => ({
  Jws: {
    signer: jest.fn().mockImplementation(() => ({
      sign: jest.fn(),
    })),
  },
  Errors: {
    MojaloopApiErrorCodes: {
      VALIDATION_ERROR: {
        code: '3100'
      }
    }
  }
}))


describe('PingPongModel', () => {
  let mockData: PingPongData;
  let mockConfig: PingPongModelConfig;
  const RedisConfig: any = {
    "enabled": true,
    "type": "redis-cluster",
    "connectionConfig": {
      "cluster": [
        { "host": "localhost", "port": 6379 }
      ]
    }
  }
  const modelMockLogger = mockLogger()

  beforeEach(() => {
    mockData = {
      requestId: '12345',
      request: {
        headers: {
          'fspiop-destination': 'test-destination',
          'fspiop-signature': 'test-signature',
        },
        payload: {},
      },
      currentState: 'start',
    };

    mockConfig = {
      kvs: new RedisClient() as unknown as Util['Redis']['RedisCache'],
      key: 'cache-key',
      logger: modelMockLogger as unknown as ILogger,
      appConfig: {
        ENDPOINT_SECURITY: {
          JWS: {
            JWS_SIGN: true,
            JWS_SIGNING_KEY: 'test-key',
            JWS_SIGNING_KEY_PATH: '/path/to/signing/key',
            JWS_VERIFICATION_KEYS_DIRECTORY: '/path/to/verification/keys',
          },
        },
        HUB_PARTICIPANT: {
          NAME: 'test-hub',
        },
        SWITCH_ENDPOINT: 'http://test-switch',
      } as ServiceConfig,
      subscriber: new RedisClient() as unknown as Util['Redis']['PubSub'],
    };
  });

  it('should create a PingPongModel instance', async () => {
    const model = await create(mockData, mockConfig);
    expect(model).toBeInstanceOf(PingPongModel);
    expect(model['config']).toEqual(mockConfig);
  });

  it('should generate the correct notification channel', () => {
    const channel = PingPongModel.notificationChannel('12345');
    expect(channel).toBe('pingPong_12345');
  });

  it('should throw an error if notificationChannel is called with an invalid id', () => {
    expect(() => PingPongModel.notificationChannel('')).toThrow(
      "PISPDiscoveryModel.notificationChannel: 'id' parameter is required"
    );
  });

  it('should return a JWS signer if conditions are met', () => {
    const model = new PingPongModel(mockData, mockConfig);
    const signer = model.getJWSSigner('test-hub');
    expect(signer).toBeDefined();
  });

  it('should return undefined if JWS signing is disabled', () => {
    mockConfig.appConfig.ENDPOINT_SECURITY.JWS.JWS_SIGN = false;
    const model = new PingPongModel(mockData, mockConfig);
    const signer = model.getJWSSigner('test-hub');
    expect(signer).toBeUndefined();
  });

  it('should handle onRequestPing successfully', async () => {
    const model = new PingPongModel(mockData, mockConfig);
    (Util.Endpoints.getEndpoint as jest.Mock).mockResolvedValue('http://test-endpoint');
    (Util.Request.sendRequest as jest.Mock).mockResolvedValue({});

    const promise = model.onRequestPing();
    const channel = PingPongModel.notificationChannel(mockData.requestId);

    await promise;
    model.subscriber.publish(channel, {
      headers: {},
      body: {
        requestId: mockData.requestId,
      }
    });

    expect(model['data'].response).toEqual({
      requestId: mockData.requestId,
      fspPutResponse: {
        headers: {},
        body: {
          requestId: mockData.requestId,
        }
      },
      pingStatus: PingStatus.SUCCESS,
    });
  });

  it('should return unreachable response if getEndpoint returns error', async () => {
    const model = new PingPongModel(mockData, mockConfig);
    (Util.Endpoints.getEndpoint as jest.Mock).mockRejectedValue(new Error('Endpoint error'));
    await model.onRequestPing()
    expect(model['data'].response).toEqual({ requestId: '12345', fspPutResponse: null, pingStatus: PingStatus.NOT_REACHABLE })
  });

  it('should return unreachable response if sendEndpoint returns error', async () => {
    const model = new PingPongModel(mockData, mockConfig);
    (Util.Request.sendRequest as jest.Mock).mockRejectedValue(new Error('Endpoint error'));
    await model.onRequestPing()
    expect(model['data'].response).toEqual({ requestId: '12345', fspPutResponse: null, pingStatus: PingStatus.NOT_REACHABLE })
  });

  it('should return the correct response from getResponse', () => {
    const model = new PingPongModel(mockData, mockConfig);
    model['data'].response = { requestId: '12345', fspPutResponse: { test: 'response' }, pingStatus: PingStatus.SUCCESS };
    const response = model.getResponse();
    expect(response).toEqual({ requestId: '12345', fspPutResponse: { test: 'response' }, pingStatus: PingStatus.SUCCESS });
  });

  it('should run the workflow and transition states correctly', async () => {
    const model = new PingPongModel(mockData, mockConfig);
    Object.defineProperty(model, 'fsm', {
      value: {
        requestPing: jest.fn().mockResolvedValue(undefined),
        error: jest.fn(),
      },
      writable: false,
    });

    const response = await model.run();
    expect(model.fsm.requestPing).toHaveBeenCalled();
    expect(response).toBeUndefined();
  });

  it('should handle errors during the run workflow', async () => {
    const model = new PingPongModel(mockData, mockConfig);
    Object.defineProperty(model, 'fsm', {
      value: {
        requestPing: jest.fn().mockRejectedValue(new Error('Test error')),
        error: jest.fn(),
      },
      writable: false,
    });

    await expect(model.run()).rejects.toThrow('Test error');
    expect(model.fsm.error).toHaveBeenCalled();
  });
});
