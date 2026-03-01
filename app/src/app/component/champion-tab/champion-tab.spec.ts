import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionTab } from './champion-tab';

describe('ChampionTab', () => {
  let component: ChampionTab;
  let fixture: ComponentFixture<ChampionTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChampionTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ChampionTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
