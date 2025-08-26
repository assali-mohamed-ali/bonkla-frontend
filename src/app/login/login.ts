import { Component } from '@angular/core';
import {Auth} from '../services/auth';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';

  constructor(private auth: Auth, private router: Router) {}

  submit() {
    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          alert('Connexion réussie !');
          this.router.navigate(['/']);
        },
        error: (err) => alert(err.error.message)
      });
  }
}
