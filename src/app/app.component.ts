import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private bird = { x: 150, y: 200, size: 40, velocity: 0, gravity: 0.5, imageIndex: 0 };
  private pipes: { x: number; y: number; width: number; height: number; gap: number }[] = [];
  private score = 0;
  isGameRunning = false;
  gameOver = false;

  private birdImages: HTMLImageElement[] = []; // Array to hold bird images

  ngOnInit() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.loadBirdImages();
    this.initGame();
  }

  loadBirdImages() {
    const imagePaths = [
      'assets/m1.jpg',
      'assets/m2.jpg',
      'assets/m3.jpg',
      'assets/m4.jpg',
      'assets/m6.jpg',
      'assets/m7.jpg',
      'assets/m8.jpg',
      'assets/m9.jpg',
      'assets/m10.jpg',
      'assets/m11.jpg',
      'assets/m12.jpg',
    ];

    this.birdImages = imagePaths.map((path) => {
      const img = new Image();
      img.src = path;
      return img;
    });
  }

  initGame() {
    this.bird.y = 200;
    this.bird.velocity = 0;
    this.bird.imageIndex = 0;
    this.score = 0;
    this.gameOver = false;

    this.pipes = Array.from({ length: 3 }, (_, i) => ({
      x: 800 + i * 300,
      y: Math.random() * 300 + 100,
      width: 50,
      height: 200,
      gap: 150,
    }));

    document.addEventListener('keydown', (event) => {
      console.log(event.code);
      if (event.code === 'Space' && this.isGameRunning) {
        this.bird.velocity = -8; // Bird jumps
        this.bird.imageIndex = (this.bird.imageIndex + 1) % this.birdImages.length; // Cycle through bird images
      }
    });
    this.gameCanvas.nativeElement.addEventListener('click', (event) => {
      if (this.isGameRunning) {
        this.bird.velocity = -8; // Bird jumps
        this.bird.imageIndex = (this.bird.imageIndex + 1) % this.birdImages.length; // Cycle through bird images
      }
    });
  }

  startGame() {
    this.isGameRunning = true;
    this.startGameLoop();
  }

  restartGame() {
    this.initGame();
    this.startGame();
  }

  startGameLoop() {
    const update = () => {
      if (!this.isGameRunning) return;

      this.updateGameLogic();
      this.render();

      if (this.gameOver) {
        this.isGameRunning = false;
        return;
      }

      requestAnimationFrame(update);
    };

    update();
  }

  updateGameLogic() {
    // Bird physics
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Move pipes
    this.pipes.forEach((pipe) => {
      pipe.x -= 2;

      // Reset pipe when it goes off-screen
      if (pipe.x + pipe.width < 0) {
        pipe.x = 800;
        pipe.y = Math.random() * 300 + 100;
        this.score++;
      }
    });

    // Collision detection
    this.pipes.forEach((pipe) => {
      if (
        (this.bird.x + this.bird.size > pipe.x &&
          this.bird.x < pipe.x + pipe.width &&
          (this.bird.y < pipe.y || this.bird.y + this.bird.size > pipe.y + pipe.gap)) ||
        this.bird.y + this.bird.size > 600 // Hits ground
      ) {
        this.gameOver = true; // End game
      }
    });
  }

  render() {
    this.ctx.clearRect(0, 0, 800, 600);

    // Draw bird
    const birdImage = this.birdImages[this.bird.imageIndex];
    if (birdImage.complete) {
      this.ctx.drawImage(birdImage, this.bird.x, this.bird.y, this.bird.size, this.bird.size);
    }

    // Draw pipes
    this.ctx.fillStyle = 'green';
    this.pipes.forEach((pipe) => {
      this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
      this.ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, 600 - pipe.y - pipe.gap);
    });

    // Draw score
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Monad Score: ${this.score}`, 10, 20);

    // Display game over
    if (this.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '40px Arial';
      this.ctx.fillText('Game Over', 300, 300);
    }
  }
}
