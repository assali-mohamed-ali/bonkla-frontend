import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, BasicUser } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit {
  q = '';
  results: BasicUser[] = [];

  constructor(
    private readonly users: UserService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const qp = params.get('q') || '';
      this.q = qp;
      if (qp.trim()) {
        this.runSearch(qp.trim());
      } else {
        this.results = [];
        this.cdr.markForCheck();
      }
    });
  }

  submit() {
    const query = this.q.trim();
    if (!query) { this.results = []; this.cdr.markForCheck(); return; }
    this.runSearch(query);
  }

  private runSearch(query: string) {
    this.users.search(query).subscribe({
      next: (res) => { this.results = res; this.cdr.markForCheck(); },
      error: (e) => console.error('Search failed', e)
    });
  }
}


