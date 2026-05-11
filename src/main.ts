import '../style.css';
import StartGame from './game/main';
import { mobileControls } from './input/mobileControls';

document.addEventListener('DOMContentLoaded', () => {
    mobileControls.initialize();
    StartGame('game-container');
});
