import {Component, ElementRef, ViewChild} from '@angular/core';
@Component({
  selector: 'app-feed',
  imports: [

  ],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class Feed {
  videos: string[] = ['/video/Vidéo sans titre ‐ Réalisée avec Clipchamp (2).mp4','/video/reel insta.mp4'];
  currentIndex :number = 0;
}
