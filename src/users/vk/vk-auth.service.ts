import qs from 'querystring';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import { VkAccessTokenResponse } from './vk-access-token-response.type';
import { UsersService } from '../users.service';
import { AuthProviderType } from '../auth-provider-type.enum';
import { VkCallbackQueryDto } from './dto/vk-calback-query.dto';
import { setTokenCookie } from '../set-token-cookie';
import { AuthService } from '../auth.service';
import { OauthState } from './oauth-state.type';

dotenv.config();

const VK_CLIENT_ID = process.env.VK_CLIENT_ID;
const VK_CLIENT_SECRET = process.env.VK_CLIENT_SECRET;
const VK_OAUTH_URL = process.env.VK_OAUTH_URL;
const VK_OAUTH_REDIRECT_URI = process.env.VK_OAUTH_REDIRECT_URI;

const VkApi: AxiosInstance = Axios.create({
  baseURL: VK_OAUTH_URL,
});

@Injectable()
export class VkAuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _authService: AuthService,
  ) {}

  async authorize(res: Response, redirect_uri?: string) {
    const stateObject: OauthState = {
      redirect_uri,
    };

    const params = {
      client_id: VK_CLIENT_ID,
      redirect_uri: VK_OAUTH_REDIRECT_URI,
      response_type: 'code',
      state: JSON.stringify(stateObject),
    };

    const paramsString = qs.stringify(params);
    res.redirect(`${VK_OAUTH_URL}/authorize?${paramsString}`);
  }

  async authorizeCallback(
    res: Response,
    vkCallbackQueryDto: VkCallbackQueryDto,
  ) {
    const { code, state: stateString } = vkCallbackQueryDto;
    const state: OauthState = JSON.parse(stateString);
    const vkRes = await VkApi.get<VkAccessTokenResponse>('/access_token', {
      params: {
        client_id: VK_CLIENT_ID,
        client_secret: VK_CLIENT_SECRET,
        redirect_uri: VK_OAUTH_REDIRECT_URI,
        code,
      },
    });

    const { user_id } = vkRes.data;
    if (!user_id) {
      throw new Error('Вк oauth не отправил user_id');
    }

    const authProvider = await this._usersService.createOrGegAuthProvider(
      user_id.toString(),
      AuthProviderType.VKONTAKTE,
    );
    const uiRedirectUri = state.redirect_uri || '/api/v1/graphql';
    const accessToken = await this._authService.createTokensByUser(
      authProvider.user,
    );
    setTokenCookie(res, accessToken);
    res.redirect(uiRedirectUri);
  }
}
