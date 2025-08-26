import { Component } from '@angular/core';
import {Auth} from '../services/auth';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username = '';
  email = '';
  password = '';
  role='client';

  constructor(private auth: Auth, private router: Router) {}

  submit() {
    this.auth.register({ username: this.username, email: this.email, password: this.password,role:this.role })
      .subscribe({
        next: () => {
          alert('Inscription réussie !');
          this.router.navigate(['/login']);
        },
        error: (err) => alert(err.error.message)
      });
  }
}
