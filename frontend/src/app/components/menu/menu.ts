import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FavoritoService } from '../../services/favorito.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  auth = inject(AuthService);
  private router = inject(Router);
  private favoritos = inject(FavoritoService);

  sair(): void {
    this.auth.logout();
    this.favoritos.limpar();
    this.router.navigate(['/']);
  }
}
