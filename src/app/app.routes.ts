import { Routes } from '@angular/router';
import {Feed} from './feed/feed';
import {Login} from './login/login';
import {Register} from './register/register';
import {Post} from './post/post';
import {Home} from './home/home';
import {Profile} from './profile/profile';
import {Settings} from './settings/settings';
import {authGuardGuard} from './guards/auth-guard-guard';

export const routes: Routes = [
  {path:'',component:Home},
  {path:'feed',component:Feed},
  {path:'login',component:Login},
  {path:'register',component:Register},
  {path:'post',component:Post ,canActivate: [authGuardGuard]},
  { path: 'profile', component: Profile ,canActivate: [authGuardGuard]},
  { path: 'settings', component: Settings ,canActivate: [authGuardGuard]},

];
