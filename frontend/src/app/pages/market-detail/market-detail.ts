import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Market, Trade, Comment } from '../../models/product';

@Component({
  selector: 'app-market-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './market-detail.html',
  styleUrl: './market-detail.css'
})
export class MarketDetail implements OnInit {
  market: Market | null = null;
  trades: Trade[] = [];
  comments: Comment[] = [];
  errorMessage: string = '';

  traderName: string = '';
  commentAuthor: string = '';
  commentText: string = '';

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMarket(id);
    this.loadTrades(id);
    this.loadComments(id);
  }

  loadMarket(id: number) {
    this.api.getMarket(id).subscribe({
      next: (data) => {
        this.market = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  loadTrades(id: number) {
    this.api.getTrades(id).subscribe({
      next: (data) => {
        this.trades = data;
        this.cdr.detectChanges();
      },
      error: (err) => this.errorMessage = err.message
    });
  }

  loadComments(id: number) {
    this.api.getComments(id).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (err) => this.errorMessage = err.message
    });
  }

  placeTrade(choice: boolean) {
    if (!this.market) return;
    this.api.createTrade({
      market: this.market.id,
      trader_name: 'Anonymous',
      choice: choice
    }).subscribe({
      next: () => {
        this.loadMarket(this.market!.id);
        this.loadTrades(this.market!.id);
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  addComment() {
    if (!this.commentAuthor.trim() || !this.commentText.trim() || !this.market) {
      this.errorMessage = 'Fill in your name and comment';
      this.cdr.detectChanges();
      return;
    }
    this.api.createComment({
      market: this.market.id,
      author_name: this.commentAuthor.trim(),
      text: this.commentText.trim()
    }).subscribe({
      next: () => {
        this.loadComments(this.market!.id);
        this.commentText = '';
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  deleteMarket() {
    if (!this.market) return;
    this.api.deleteMarket(this.market.id).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }
}
