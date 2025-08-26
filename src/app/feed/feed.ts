import { Component } from '@angular/core';
import {Header} from '../header/header';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-feed',
  imports: [
    Header,
    RouterOutlet
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class Feed {

}
