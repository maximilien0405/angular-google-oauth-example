import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Observable, Subject } from 'rxjs';


const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  strictDiscoveryDocumentValidation: false,
  redirectUri: 'http://localhost:52316',
  clientId: '723095882457-bkg2lj5h795ejii0vfqvq43afcv9gg5g.apps.googleusercontent.com',
  scope: 'openid profile',
  showDebugInformation: true,
};

export interface UserInfo {
  info: {
    sub: string
    email: string,
    name: string,
    picture: string
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-google-oauth-example';
  userInfo?: UserInfo
  gmail = 'https://gmail.googleapis.com'
  userProfileSubject = new Subject<UserInfo>()

  constructor(private readonly oAuthService: OAuthService, private readonly httpClient: HttpClient) { }

  login() {
    // confiure oauth2 service
    this.oAuthService.configure(authCodeFlowConfig);
    // manually configure a logout url, because googles discovery document does not provide it
    this.oAuthService.logoutUrl = "https://www.google.com/accounts/Logout";

    // loading the discovery document from google, which contains all relevant URL for
    // the OAuth flow, e.g. login url
    this.oAuthService.loadDiscoveryDocument().then(() => {
      // // This method just tries to parse the token(s) within the url when
      // // the auth-server redirects the user back to the web-app
      // // It doesn't send the user the the login page
      this.oAuthService.tryLoginImplicitFlow().then(() => {

        // when not logged in, redirecvt to google for login
        // else load user profile
        if (!this.oAuthService.hasValidAccessToken()) {
        } else {
          this.oAuthService.loadUserProfile().then((userProfile) => {
            this.userProfileSubject.next(userProfile as UserInfo)
          })
        }
      })
    });

    this.userProfileSubject.subscribe(info => {
      this.userInfo = info
    })
  }

  test() {
    this.oAuthService.initLoginFlow()
  }

  logout() {
    this.oAuthService.revokeTokenAndLogout();
  }
}
