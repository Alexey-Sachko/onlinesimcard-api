import qs from 'querystring';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';
import { Auth, google } from 'googleapis';

import { UsersService } from '../users.service';
import { AuthProviderType } from '../auth-provider-type.enum';
import { setTokenCookie } from '../set-token-cookie';
import { AuthService } from '../auth.service';
import { googleConfig } from 'src/config/google';
import { GoogleAuthCallbackQueryDto } from './dto/callback-query.dto';

@Injectable()
export class GoogleAuthService {
  googleOauth2Client: Auth.OAuth2Client;

  constructor(
    private readonly _usersService: UsersService,
    private readonly _authService: AuthService,
  ) {
    this.googleOauth2Client = new google.auth.OAuth2(
      googleConfig.CLIENT_ID,
      googleConfig.CLEINT_SECRET,
      'http://localhost:4500/api/v1/auth/google/callback',
    );
  }

  async authorize(res: Response, redirect_uri?: string) {
    const url = this.googleOauth2Client.generateAuthUrl({
      scope: 'https://www.googleapis.com/auth/userinfo.email',
    });
    res.redirect(url);
  }

  async authorizeCallback(
    res: Response,
    googleAuthCallbackQueryDto: GoogleAuthCallbackQueryDto,
  ) {
    // const { code, state: stateString } = vkCallbackQueryDto;
    // const state: OauthState = JSON.parse(stateString);
    // const vkRes = await VkOauthApi.get<VkAccessTokenResponse>('/access_token', {
    //   params: {
    //     client_id: VK_CLIENT_ID,
    //     client_secret: VK_CLIENT_SECRET,
    //     redirect_uri: VK_OAUTH_REDIRECT_URI,
    //     code,
    //   },
    // });
    //     const { user_id } = vkRes.data;
    //     if (!user_id) {
    //       throw new Error('Вк oauth не отправил user_id');
    //     }
    //     const vkProfileRes = await VkApi.get(`/method/users.get`, {
    //       params: {
    //         access_token: VK_SERVICE_KEY,
    //         v: '5.52',
    //         user_id,
    //       },
    //     });
    //     const vkUser = vkProfileRes.data.response[0];
    //     const authProvider = await this._usersService.createOrGegAuthProvider(
    //       user_id.toString(),
    //       AuthProviderType.VKONTAKTE,
    //       vkUser.first_name,
    //       vkUser.last_name,
    //     );
    //     const uiRedirectUri = state.redirect_uri || '/api/v1/graphql';
    //     const accessToken = await this._authService.createTokensByUser(
    //       authProvider.user,
    //     );
    //     setTokenCookie(res, accessToken);
    //     res.redirect(uiRedirectUri);
  }
}
