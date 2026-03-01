import { Component, signal } from '@angular/core';
import { Overview } from './component/overview/overview';
import { Header } from './component/header/header';

@Component({
  selector: 'app-root',
  imports: [Header, Overview],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
