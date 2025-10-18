import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
   login =false;
  mobileMenuOpen = false;
  change = inject(ChangeDetectorRef);
 
  auth = inject(Auth);
  isAuthenticated = this.auth.isLoggedIn();
  router = inject(Router);
  ngOnInit() {
    if(this.isAuthenticated!==this.login) {
      this.change.detectChanges();
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  search(query: string) {
    const q = (query || '').trim();
    if (!q) { return; }
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
    this.change.detectChanges();
  }
}
