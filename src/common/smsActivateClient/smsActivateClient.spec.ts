import Axios from 'axios';
import { SmsActivateClient } from './smsActivateClient';

jest.mock('axios');

const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('CatsController', () => {
  let smsActivateClient: SmsActivateClient;

  beforeEach(() => {
    smsActivateClient = new SmsActivateClient(mockedAxios);
  });

  describe('get activation message', () => {
    it('should return full message', async () => {
      const code = `https://www.farpost.ru
      Пароль для входа: dp52wex6`;
      const status = 'STATUS_OK';

      mockedAxios.get.mockResolvedValue({
        data: `${status}:${code}`,
      });

      const res = await smsActivateClient.getStatus('someId');

      expect(res.code).toBe(code);
    });
  });
});
