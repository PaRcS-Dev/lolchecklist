import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Champion } from '../../obj/Champion';

@Component({
  selector: 'app-champion-tab',
  imports: [],
  templateUrl: './champion-tab.html',
  styleUrl: './champion-tab.scss',
})
export class ChampionTab {
  @Input() public champion!: Champion;
  @Input() IsSelected: boolean = false;

  @Output() ChampionClicked = new EventEmitter<void>();

  OnCardClick(): void {
    this.ChampionClicked.emit();
  }

}
